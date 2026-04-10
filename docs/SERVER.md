# Server API Reference

## Overview

The server is built with **Express.js** and **ws (WebSocket)** and manages game sessions, problem generation, and real-time state synchronization. All game logic is server-authoritative (client cannot manipulate game state).

---

## Server Entry Point

### File: `server/index.js`

Initializes Express server, WebSocket gateway, and request routing.

```javascript
// Start server
npm run dev        // Development with --watch mode
npm run start      // Production mode

// Server listens on
Host: 0.0.0.0 (default) OR process.env.HOST
Port: 3001 (default) OR process.env.PORT
```

### HTTP Endpoints

#### `GET /api/health`

Health check endpoint for load balancers and monitoring.

**Response**: 
```json
{
  "status": "ok",
  "uptime": 123.456
}
```

#### `GET /*`

Serves the built React application from `client/dist/index.html` (SPA catch-all route).

**Response**: HTML file

---

## WebSocket Protocol

### Connection

```javascript
// Client initiates connection
const ws = new WebSocket('ws://localhost:3001');

// Server accepts connection
// Room is created on first SETUP_GAME message
```

### Message Exchange Lifecycle

```
Client connects
    ↓
Client sends SETUP_GAME { payload: { difficulty, operations, teamNames, duration } }
    ↓
Server creates GameRoom instance
    ↓
Server broadcasts GAME_START with initial state
    ↓
[GAME LOOP]
Client sends ANSWER_SUBMITTED { side, answer, problemId }
Server validates answer locally (authoritative)
Server broadcasts ANSWER_RESULT + NEW_PROBLEM
    ↓
[Continue until victory condition or RAGE_QUIT]
    ↓
Server broadcasts GAME_OVER
    ↓
Client sends PLAY_AGAIN (optional) → goto [GAME LOOP]
    ↓
Client closes connection OR timeout → GameRoom cleanup
```

---

## Message Format Specification

### Client → Server Messages

All client messages must include:
- `type` (string) — message intent
- `side` (string) — either `'left'` or `'right'`
- Additional fields per message type

#### `SETUP_GAME`

Initialize a new game session.

**Required Fields**:
```javascript
{
  type: 'SETUP_GAME',
  side: 'left',  // Ignored for setup; server manages both players
  payload: {
    difficulty: 1 | 2 | 3,           // [REQUIRED]
    operations: ['add', ...],         // [OPTIONAL] default: ['add']
    teamNames: {                      // [OPTIONAL]
      left: 'Team 1',
      right: 'Team 2'
    },
    duration: 120                     // [OPTIONAL] seconds, default: 120, clamped to [10, 600]
  }
}
```

**Validation**:
- `difficulty`: Integer, must be 1, 2, or 3
- `operations`: Array of strings from `['add', 'sub', 'mul']`
- `teamNames.left/right`: Max 30 characters (substring enforced)
- `duration`: Integer, clamped to [10, 600]

**Server Response**:
```javascript
{
  type: 'GAME_START',
  payload: {
    teamNames: { left, right },
    timeRemaining: 120,
    ropeNodes: [ { x, y }, ... ],     // Array of 21 nodes
    players: {
      left: { score: 0, streak: 0 },
      right: { score: 0, streak: 0 }
    },
    problems: {
      left: { id, expression },
      right: { id, expression }
    }
  }
}
```

---

#### `ANSWER_SUBMITTED`

Submit an answer to the current problem.

**Required Fields**:
```javascript
{
  type: 'ANSWER_SUBMITTED',
  side: 'left' | 'right',           // [REQUIRED] player side
  answer: 42,                        // [REQUIRED] numeric answer
  problemId: 'uuid-string',          // [OPTIONAL] problem reference
  timestamp: Date.now()              // [OPTIONAL] client timestamp
}
```

**Validation**:
- `side`: Strictly `'left'` or `'right'` (prototype pollution prevention)
- `answer`: Must be a number
- `problemId`: String format (no length enforcement)

**Server Logic**:
1. Convert answer to Number
2. Compare against current problem answer (server-side)
3. If correct: increment score, increment streak, apply rope force
4. If incorrect: reset streak to 0
5. Generate new problem for that player
6. Broadcast result

**Server Response**:
```javascript
{
  type: 'ANSWER_RESULT',
  payload: {
    side: 'left',
    correct: true,
    correctAnswer: 42,
    score: 5,                    // Updated score
    streak: 3                    // Updated streak
  }
}
```

Then immediately:
```javascript
{
  type: 'NEW_PROBLEM',
  payload: {
    side: 'left',
    problem: {
      id: 'uuid',
      expression: '7 + 8'
    }
  }
}
```

Then periodically (every 50ms / tick):
```javascript
{
  type: 'STATE_UPDATE',
  payload: {
    ropeNodes: [ { x, y }, ... ],
    timeRemaining: 119,
    players: {
      left: { score, streak },
      right: { score, streak }
    }
  }
}
```

---

#### `RAGE_QUIT`

Player forfeits the current game.

**Required Fields**:
```javascript
{
  type: 'RAGE_QUIT',
  side: 'left' | 'right'  // [REQUIRED] which player quit
}
```

**Server Response**:
```javascript
{
  type: 'GAME_OVER',
  payload: {
    winner: 'right',           // The OTHER player wins
    reason: 'surrender',
    finalScore: {
      left: { score: 3 },
      right: { score: 7 }
    }
  }
}
```

---

#### `PLAY_AGAIN`

Restart game with same or modified settings.

**Required Fields**:
```javascript
{
  type: 'PLAY_AGAIN',
  side: 'left',  // Ignored; server manages restart
  payload: {
    difficulty: 2,        // [OPTIONAL] override difficulty
    operations: ['mul'],  // [OPTIONAL] override operations
    duration: 180         // [OPTIONAL] override duration
  }
}
```

**Server Response**: Same as `SETUP_GAME` (sends `GAME_START`)

---

## Server Response Messages

### `GAME_START`

Sent when game initializes or after `PLAY_AGAIN`.

```javascript
{
  type: 'GAME_START',
  payload: {
    teamNames: { left: 'Team 1', right: 'Team 2' },
    timeRemaining: 120,
    ropeNodes: [
      { x: -12.0, y: 300.0 },
      { x: 28.0, y: 304.2 },
      // ... 21 total nodes
    ],
    players: {
      left: { score: 0, streak: 0 },
      right: { score: 0, streak: 0 }
    },
    problems: {
      left: { id: 'uuid1', expression: '5 + 3' },
      right: { id: 'uuid2', expression: '2 × 4' }
    }
  }
}
```

---

### `ANSWER_RESULT`

Immediate feedback on submitted answer.

```javascript
{
  type: 'ANSWER_RESULT',
  payload: {
    side: 'left',
    correct: true,
    correctAnswer: 8,      // Reveal correct answer after submission
    score: 2,              // Updated total score
    streak: 2              // Current streak count
  }
}
```

---

### `NEW_PROBLEM`

New problem delivered after answer submitted.

```javascript
{
  type: 'NEW_PROBLEM',
  payload: {
    side: 'left',
    problem: {
      id: 'uid-unique',
      expression: '9 + 4'
    }
  }
}
```

---

### `STATE_UPDATE`

Periodic state broadcast (20Hz / every 50ms).

```javascript
{
  type: 'STATE_UPDATE',
  payload: {
    ropeNodes: [ { x, y }, ... ],        // Physics positions
    timeRemaining: 95,                   // Countdown
    players: {
      left: { score: 3, streak: 1 },
      right: { score: 5, streak: 3 }
    }
  }
}
```

---

### `GAME_OVER`

Victory condition met (rope pulled to threshold or time elapsed).

```javascript
{
  type: 'GAME_OVER',
  payload: {
    winner: 'left' | 'right',
    reason: 'rope' | 'timer' | 'surrender',
    finalScore: {
      left: { score: 4, streak: 2 },
      right: { score: 6, streak: 0 }
    },
    victoryThreshold: 180  // Rope offset threshold
  }
}
```

---

### `OPPONENT_DISCONNECTED`

Sent if other player closes connection during active game.

```javascript
{
  type: 'OPPONENT_DISCONNECTED',
  payload: {
    reason: 'connection_lost' | 'manual_disconnect'
  }
}
```

---

## Error Handling

### Client-Side Message Errors

If a client sends an invalid message:
- ❌ Message is silently ignored (no error response sent)
- ✅ Server logs warning to console
- ✅ Connection remains open (graceful degradation)

**Example**: Sending `side: '__proto__'` is silently rejected.

### Server-Side Errors

**JSON Parse Error**:
```
[Server] Error parsing message: Unexpected token...
```
→ Connection remains open, message ignored

**Payload Too Large** (>5KB):
```
[Server] Payload Too Large
```
→ Connection is closed with code 1009

---

## Validation Rules (Reference)

| Field | Type | Constraint | Default |
|-------|------|-----------|---------|
| `difficulty` | number | 1, 2, or 3 | 1 |
| `operations` | array | Max 10 items, strings only | ['add'] |
| `teamNames.left` | string | Max 30 chars | 'Team 1' |
| `teamNames.right` | string | Max 30 chars | 'Team 2' |
| `duration` | number | [10, 600] seconds | 120 |
| `side` | string | Strictly 'left' or 'right' | N/A |
| `answer` | number | Any numeric value | N/A |
| `payload` size | bytes | Max 5120 | N/A |

---

## GameRoom Class API

### Methods

#### `constructor(ws, config)`

Create a new game session.

```javascript
const room = new GameRoom(ws, {
  difficulty: 2,
  operations: ['add', 'sub', 'mul'],
  teamNames: { left: 'Alice', right: 'Bob' },
  duration: 180
});
```

#### `startGame()`

Initialize game loop and broadcast initial state.

```javascript
room.startGame();
// Starts 20Hz tick loop
// Starts 1Hz countdown timer
```

#### `handleAnswer(side, answer)`

Process a submitted answer (server-authoritative).

```javascript
room.handleAnswer('left', 14);
// Updates score/streak
// Broadcasts ANSWER_RESULT + NEW_PROBLEM
```

#### `handleRageQuit(side)`

Process player forfeit.

```javascript
room.handleRageQuit('left');
// Broadcasts GAME_OVER with right as winner
```

#### `resetAndRestart(newConfig)`

Restart game with updated settings.

```javascript
room.resetAndRestart({ difficulty: 3, duration: 240 });
// Resets scores, rope, timer
// Generates new problems
// Broadcasts GAME_START
```

#### `destroy()`

Clean up timers and resources.

```javascript
room.destroy();
// Clears tickInterval and timerInterval
```

---

## ProblemGenerator API

### Function: `generateProblem(options)`

Generate a single math problem.

```javascript
import { generateProblem } from './math/ProblemGenerator.js';

const problem = generateProblem({
  level: 2,           // Difficulty level [1, 2, 3]
  operation: 'mul'    // Optional: force specific operation
});

// Returns:
{
  id: 'uuid-string',
  expression: '7 × 8',
  displayExpression: '7 × 8',
  answer: 56,
  level: 2,
  operation: 'mul'
}
```

### Function: `getDifficultyConfig(level)`

Fetch configuration for difficulty level.

```javascript
import { getDifficultyConfig } from './math/DifficultyConfig.js';

const config = getDifficultyConfig(2);
// Returns:
{
  label: 'Medium',
  minOperand: 1,
  maxOperand: 20,
  allowedOps: ['add', 'sub', 'mul'],
  description: 'All operations with numbers 1-20'
}
```

---

## PayloadValidator API

### Function: `validateClientPayload(rawMessage)`

Validates incoming WebSocket message.

```javascript
import { validateClientPayload } from './network/PayloadValidator.js';

const result = validateClientPayload('{"type":"ANSWER_SUBMITTED",...}');

// Returns:
{
  isValid: true,
  data: {
    type: 'ANSWER_SUBMITTED',
    answer: 42,
    problemId: 'uuid',
    timestamp: 1681234567890
  }
}

// Or on error:
{
  isValid: false,
  error: 'Malformed JSON payload'
}
```

---

## RopePhysics API

### Class: `RopePhysics`

Manages rope physics simulation.

#### Constructor

```javascript
const rope = new RopePhysics();
// Initializes 21 nodes in neutral position
```

#### `reset()`

Reset rope to starting position.

```javascript
rope.reset();
// centerOffset = 0
// All nodes at REST_Y = 300px
```

#### `applyForce(side)`

Pull rope toward specified side.

```javascript
rope.applyForce('left');   // Pull left by 12px
rope.applyForce('right');  // Pull right by 12px
```

#### `tick()`

Advance physics simulation by one frame.

```javascript
rope.tick();
// Updates node positions
// Solves constraints
// Checks victory condition
```

#### `checkVictory()`

Check if victory condition is met.

```javascript
const winner = rope.checkVictory();
// Returns 'left' | 'right' | null
// Threshold: ±180px centerOffset
```

#### `getNodePositions()`

Get current node positions.

```javascript
const nodes = rope.getNodePositions();
// Returns: [{ x, y }, { x, y }, ...]  (21 items)
```

---

## Logging & Debugging

### Server-Side Logs

Enable detailed logging:

```bash
NODE_DEBUG=* npm run dev:server
```

### Common Log Messages

```
[Server] Client connected
[Server] Game started with config: { difficulty: 2, ... }
[Server] Client disconnected
[Server] WS error: ...
[Server] Payload Too Large
[Server] Invalid side: __proto__
```

---

## Performance Tips

1. **Limit concurrent games** — Keep under 50 per Node process
2. **Monitor message rate** — Cap at 1 message per 100ms per client
3. **Profile physics** — Verlet constraint iterations (currently 8)
4. **Tune tick rate** — 20Hz is practical; 30Hz uses more CPU

---

## Scaling & Deployment

### Single Server

- ✅ Supports ~50 concurrent games
- ✅ Handles ~100 concurrent players
- ✅ Recommended for LAN / classroom use

### Production Clustering

For >50 concurrent games, implement:

```javascript
// Use Node.js cluster module
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
```

Then add **Redis pub-sub** for inter-cluster communication.

---

## Testing the Server

### Manual Test: Connection

```bash
# Terminal 1: Start server
npm run dev:server

# Terminal 2: Establish connection
npm run dev:client

# Or use websocat CLI
websocat ws://localhost:3001
```

Then send:
```json
{"type":"SETUP_GAME","side":"left","payload":{"difficulty":1}}
```

### Performance Test: Load

```bash
# Use Apache Bench / autocannon
npx autocannon -c 10 http://localhost:3001/api/health
```

