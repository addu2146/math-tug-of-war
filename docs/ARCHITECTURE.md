# Architecture Overview

## System Design

Math Tug-of-War follows a **client-server architecture** with **same-screen local multiplayer** gameplay. The system is optimized for low-latency turn-based problem solving rather than real-time continuous input streaming.

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│  (Components, Hooks, Game State Management)             │
├─────────────────────────────────────────────────────────┤
│                  Phaser 3 Game Engine                   │
│  (Sprite rendering, Animation, Input handling)         │
├─────────────────────────────────────────────────────────┤
│              WebSocket Connection (ws://)               │
│         (Bi-directional real-time communication)        │
├─────────────────────────────────────────────────────────┤
│                Express.js Server                         │
│  (HTTP routing, static file serving, WS gateway)        │
├─────────────────────────────────────────────────────────┤
│              GameRoom Instance (per connection)          │
│  (Game logic, player state, rope physics)               │
├─────────────────────────────────────────────────────────┤
│    Problem Generator + Difficulty Configuration          │
│  (Safe math evaluation, calibrated problem ranges)      │
└─────────────────────────────────────────────────────────┘
```

---

## Client Architecture

### Component Hierarchy

```
App.jsx
├── LandingPage
│   ├── GameSelectGrid
│   └── SettingsPanel
├── LandscapePrompt
└── GameLayout
    ├── GameHeader
    │   ├── PlayerPanel (left)
    │   ├── ScoreBar (center)
    │   └── PlayerPanel (right)
    ├── CenterPanel
    │   └── PhaserGame (canvas container)
    │       └── BootScene + TugScene
    └── BottomPanel
        ├── Numpad
        ├── AnswerButton
        └── ExitButton
```

### Data Flow Model

```
SetupWizard (user input)
    ↓
GameLayout (state orchestration)
    ↓
useWebSocket() (network I/O)
    ↓
PhaserGame / TugScene (visual rendering)
    ↓
EventBus (internal game events)
    ↓
PlayerPanel / ScoreBar / VictoryModal (UI updates)
```

### Custom Hooks

- **useWebSocket()** — Manages WebSocket connection, message parsing, auto-reconnect
- **useGameState()** — Centralizes game state (score, streak, problems) with Redux-like pattern

### EventBus Pattern

React components and Phaser scenes communicate through **EventBus** (pub-sub model) to avoid direct coupling:

```javascript
// From React component
EventBus.emit('ANSWER_SUBMITTED', { side: 'left', answer: 42 });

// In Phaser scene
EventBus.on('ROPE_UPDATE', (positions) => {
    this.rope.updateNodePositions(positions);
});
```

This pattern ensures:
- ✅ React components don't call Phaser methods directly
- ✅ Phaser scenes don't manipulate DOM elements
- ✅ Loose coupling enables independent testing

---

## Server Architecture

### Entry Point: `server/index.js`

```javascript
┌─────────────────────────────────────────────┐
│ HTTP Server (Express)                       │
├─────────────────────────────────────────────┤
│ WebSocket Server (ws://0.0.0.0:3001)        │
├─────────────────────────────────────────────┤
│ Message Router + Payload Validator          │
├─────────────────────────────────────────────┤
│ GameRoom Pool (Map<WebSocket, GameRoom>)    │
├─────────────────────────────────────────────┤
│ Static File Serving (client/dist)           │
└─────────────────────────────────────────────┘
```

### Server Validation Pipeline

```
Raw WebSocket Message
    ↓
[STEP 1] Size Check (max 5KB) + JSON parse
    ↓
[STEP 2] Payload Validator (validateClientPayload)
    - Verify message type against whitelist
    - Extract & sanitize typed fields
    - Validate side parameter (left|right only)
    ↓
[STEP 3] GameRoom Routing
    - Route to appropriate handler (ANSWER_SUBMITTED, RAGE_QUIT, etc.)
    ↓
[STEP 4] Game Logic Layer
    - Update player state
    - Generate new problems
    - Calculate rope physics
    ↓
[STEP 5] State Broadcast
    - Serialize game state
    - Send via WebSocket.send()
```

### GameRoom Instance Lifecycle

```
Connection (WebSocket open)
    ↓
SETUP_GAME message → Create GameRoom instance
    ↓
startGame() → Spawn initial problems, start 20Hz tick
    ↓
[GAME LOOP]
    handleAnswer() → Validate answer, update rope
    tick() → Physics simulation, state broadcast
    ↓
Victory condition met
    ↓
endGame() → Announce winner, allow PLAY_AGAIN
    ↓
Disconnection (WebSocket close) → cleanup()
```

### Problem Generation Pipeline

```
ProblemGenerator.generateProblem({ level, operation })
    ↓
[Get difficulty bounds from DifficultyConfig]
    ↓
[Generate random operands within bounds]
    ↓
[Build expression string: "a OP b"]
    ↓
[Evaluate with mathjs.evaluate()]
    ↓
{
  id: UUID,
  expression: "3 + 5",
  displayExpression: "3 + 5",
  answer: 8,
  level: 1,
  operation: "add"
}
```

---

## Data Models

### GameRoom State

```javascript
{
  ws: WebSocket,                    // Connection reference
  rope: RopePhysics,               // Physics engine instance
  gameActive: boolean,              // Game running flag
  difficulty: 1|2|3,                // Difficulty level
  operations: ['add', 'sub'],       // Allowed operations
  teamNames: { left, right },       // Custom team labels
  gameDuration: number,             // Seconds (10-600)
  timeRemaining: number,            // Countdown timer
  players: {
    left: {
      score: number,                // Correct answers count
      streak: number,               // Consecutive correct
      problem: ProblemData,         // Current problem
      inputValue: string            // User input (if applicable)
    },
    right: { /* same as left */ }
  }
}
```

### ProblemData

```javascript
{
  id: string,                       // Unique UUID
  expression: string,               // Display string (e.g., "3×5")
  displayExpression: string,        // Math notation
  answer: number,                   // Correct answer
  level: 1|2|3,                    // Difficulty level
  operation: 'add'|'sub'|'mul'     // Operation type
}
```

### RopePhysics State

```javascript
{
  nodes: [                          // 21 point-masses
    { x, y, prevX, prevY },        // Verlet integration
    ...
  ],
  centerOffset: number,             // Rope horizontal position
  targetOffset: number,             // Goal position (spring target)
  velocity: number                  // Current momentum
}
```

---

## Security Architecture

### Input Validation (Zero Trust)

```javascript
// Three-layer validation approach:

Layer 1: Protocol Level
  - Message size limit: 5KB max
  - JSON parse protection (try-catch)

Layer 2: Type Validation
  - Message type whitelist (CLIENT_MESSAGES enum)
  - Field presence checks

Layer 3: Value Validation
  - Side: strictly 'left' OR 'right' (no prototype injection)
  - Answer: numeric type only
  - Duration: clamped to [10, 600] seconds
  - Team names: substring(0, 30) + toString()
```

### No Eval Environment

The system **never** uses JavaScript's `eval()`. Instead:
- ✅ mathjs.evaluate() for calculated problems
- ✅ Operands generated by server (no client-supplied math expressions)
- ✅ Static string formatting: `${a} ${op} ${b}`

---

## Physics Engine: Verlet Integration

### Rope Model

- **21 nodes** arranged horizontally
- **Segment length**: 800px ÷ 20 = 40px per segment
- **Gravity**: 0.4px/frame² downward
- **Damping**: 98.5% velocity retention (realistic swing-down)

### Constraint Solving

Each frame:
1. **Verlet step** — Update positions based on velocity
2. **Constraint relaxation** — 8 iterations to enforce segment lengths
3. **Endpoint pinning** — Rope endpoints tied to handler positions
4. **Distance constraints** — Keep adjacent nodes ~40px apart

### Victory Condition

When rope's `centerOffset` reaches ±180px, the corresponding team wins.

---

## Communication Protocol

### Message Types

**Client → Server**:
- `SETUP_GAME` — Initialize game with config
- `ANSWER_SUBMITTED` — Player submitted an answer
- `RAGE_QUIT` — Player forfeited
- `PLAY_AGAIN` — Restart game

**Server → Client**:
- `GAME_START` — Game initialized, problems assigned
- `ANSWER_RESULT` — Feedback on submitted answer
- `NEW_PROBLEM` — New problem delivered
- `STATE_UPDATE` — Rope position, scores updated
- `GAME_OVER` — Winner announced
- `OPPONENT_DISCONNECTED` — Other player left

### Tick Rate

- **Game Loop**: 20Hz (50ms per frame)
- **Timer Countdown**: 1Hz (1 second per update)
- **WebSocket Broadcast**: Every game tick (~50ms)

---

## Performance & Scalability

### Memory

- **Per session** (one GameRoom): ~50KB average
- **Per concurrent players** (WebSocket + state): ~150KB
- **Payload buffer** (message validation): capped at 5KB

### CPU Utilization

- **Physics tick**: ~0.5ms per frame (verlet + constraints)
- **Problem generation**: ~0.1ms per generation
- **Message parsing**: ~0.2ms per message
- **Broadcast serialization**: ~1ms per 50ms tick

### Scalability

Current design supports:
- 🟢 **1-50 concurrent games** (single Node.js process)
- 🟡 **50-200 concurrent games** (requires clustering)
- 🔴 **200+ concurrent games** (requires horizontal scaling + load balancer)

For production scaling, implement:
- Redis pub-sub for inter-process messaging
- Horizontal scaling behind NGINX/HAProxy
- Database persistence for match history

---

## Error Handling Strategy

### Client-Side

- WebSocket auto-reconnect every 2 seconds
- Graceful degradation if server becomes unreachable
- User feedback through modal dialogs

### Server-Side

- Try-catch around JSON parsing
- Validation errors logged but connection preserved
- Invalid messages silently ignored (no error-message feedback)
- Room cleanup on disconnection

---

## Future Architecture Improvements

1. **State Persistence** — Save match results to database
2. **Matchmaking** — Cross-network multiplayer support
3. **Analytics** — Track problem difficulty effectiveness
4. **Testing** — Unit tests for GameRoom, RopePhysics, ProblemGenerator
5. **Clustering** — Node.js cluster module for multi-core utilization

