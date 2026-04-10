# Client-Side Documentation

## Overview

The client is a **React 19** + **Phaser 3** frontend that provides an interactive user interface for game setup, real-time gameplay visualization, and multiplayer interaction. Communication with the server happens exclusively through **WebSocket**.

---

## Component Structure

### Root Component: `App.jsx`

Main entry point that orchestrates view switching.

```javascript
export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  
  return (
    <div className="game-wrapper">
      <LandscapePrompt />  {/* Mobile orientation warning */}
      <div className="game-container">
        {currentView === 'landing' && <LandingPage ... />}
        {currentView === 'tug-of-war' && <GameLayout ... />}
      </div>
    </div>
  );
}
```

**State Management**:
- `currentView` — Controls which screen is displayed ('landing' or 'tug-of-war')

**Props to Children**:
- `LandingPage` → `onSelectGame(gameId)` callback
- `GameLayout` → `onBackToMenu()` callback

---

## Page Components

### 1. LandingPage.jsx

Initial screen where players select game difficulty and configure teams.

**Key Features**:
- Displays available difficulty levels (Easy, Medium, Hard)
- Game selection grid with descriptions
- Navigates to SetupWizard on selection

**Props**:
```javascript
{
  onSelectGame: (gameId) => void  // Fired when player selects a game
}
```

**Features**:
- Icon/image for each difficulty
- Descriptive text (operations included)
- Smooth transitions

---

### 2. GameLayout.jsx

Main game container that orchestrates all gameplay components.

**Component Hierarchy**:
```
GameLayout
├── GameHeader
│   ├── PlayerPanel (left team)
│   ├── ScoreBar (center with streak)
│   └── PlayerPanel (right team)
├── CenterPanel
│   └── PhaserGame (game canvas)
│       └── BootScene + TugScene
└── BottomPanel
    ├── Numpad
    ├── AnswerButton
    └── ExitButton
```

**Key Responsibilities**:
- Manages WebSocket connection via `useWebSocket()`
- Coordinates game state via `useGameState()`
- Broadcasts events through EventBus
- Listens for game state updates

**Props**:
```javascript
{
  onBackToMenu: () => void  // Return to landing page
}
```

---

### 3. SetupWizard.jsx

Configuration wizard for game settings (difficulty, team names, duration).

**Features**:
- Difficulty selector (Easy / Medium / Hard)
- Team name input fields
- Game duration slider
- Confirmation button

**State**:
```javascript
{
  difficulty: 1 | 2 | 3,
  teamNames: { left: string, right: string },
  duration: number,          // seconds
  operations: string[]       // auto-selected per difficulty
}
```

---

## GameUI Components

### PlayerPanel.jsx

Displays a single team's stats (left or right).

**Props**:
```javascript
{
  side: 'left' | 'right',       // Which team
  teamName: string,              // Team label
  score: number,                 // Current score
  streak: number,                // Consecutive correct
  currentProblem: ProblemData,   // Current problem to solve
  isPlayerTurn: boolean          // Can this team answer? (optional)
}
```

**Displays**:
- Team name
- Current score
- Current streak
- Current problem expression
- Animated streak badge

---

### ScoreBar.jsx

Center panel showing game progress.

**Props**:
```javascript
{
  leftScore: number,
  rightScore: number,
  timeRemaining: number,         // Countdown timer
  maxTime: number,               // Total game duration
}
```

**Features**:
- Score displayed as numbers
- Countdown timer
- Progress bar or visual indicator

---

### CenterPanel.jsx

Canvas container for the Phaser game rendering.

**Props**:
```javascript
{
  ropeNodes: Array<{x, y}>,     // Rope physics positions
  leftTeamName: string,
  rightTeamName: string,
}
```

**Contains**:
- PhaserGame component (canvas)
- Character animations
- Rope rendering with physics

---

### Numpad.jsx

Glassmorphic numeric input pad for answer submission.

**Features**:
- 10 buttons (0-9) with glass-effect styling
- Backspace / clear button
- Current input display
- Responsive to touch/click

**Props**:
```javascript
{
  onInput: (digit: string) => void,      // Digit pressed
  onBackspace: () => void,               // Clear inputs
  onSubmit: (answer: number) => void,    // Confirm answer
  disabled: boolean,                     // Disable during feedback
}
```

---

### AnswerButton.jsx

Submit button for confirmed answer.

**Props**:
```javascript
{
  onClick: () => void,
  disabled: boolean,
  label: string = 'SUBMIT'
}
```

---

### VictoryModal.jsx

Full-screen modal showing game results.

**Props**:
```javascript
{
  winner: 'left' | 'right',
  leftScore: number,
  rightScore: number,
  reason: 'rope' | 'timer' | 'surrender',
  onPlayAgain: () => void,
  onBackToMenu: () => void,
}
```

**Features**:
- Celebration animation for winner
- Score breakdown
- Play Again / Menu buttons

---

### Countdown.jsx

Timer display component.

**Props**:
```javascript
{
  timeRemaining: number,  // Seconds
  maxTime: number,        // Total seconds
}
```

**Display**:
- MM:SS format
- Animated color change as time runs out
- Optional warning state (last 10 seconds)

---

### StepIndicator.jsx

Progress tracker for SetupWizard.

**Props**:
```javascript
{
  currentStep: number,    // 1, 2, 3, etc.
  totalSteps: number,
  stepLabels: string[]
}
```

---

### LandscapePrompt.jsx

Mobile orientation detection and warning.

**Features**:
- Detects portrait orientation
- Displays overlay suggesting landscape mode
- Auto-hides when landscape detected

---

## Custom Hooks

### useWebSocket()

Manages WebSocket connection with auto-reconnect.

**Location**: `client/src/hooks/useWebSocket.js`

**API**:
```javascript
const { sendMessage, isConnected } = useWebSocket(onMessage);

// onMessage callback signature:
(message: { type: string, payload: any }) => void

// sendMessage:
sendMessage('ANSWER_SUBMITTED', { side: 'left', answer: 42 });
```

**Features**:
- ✅ Auto-reconnect after 2 seconds on disconnect
- ✅ Message parsing and validation
- ✅ Connection state tracking
- ✅ Graceful error handling

**Internal State**:
```javascript
{
  wsRef: WebSocketRef,
  isConnected: boolean,
  onMessageRef: CallbackRef
}
```

---

### useGameState()

Central game state management (Redux-like pattern).

**Location**: `client/src/hooks/useGameState.js`

**API**:
```javascript
const {
  gameState,
  updatePlayerScore,
  updateRopePosition,
  updateCurrentProblem,
  resetGameState
} = useGameState();

// gameState structure:
{
  players: {
    left: { score, streak, problem },
    right: { score, streak, problem }
  },
  rope: { nodes: [{x, y}, ...] },
  time: { remaining, total },
  gameStatus: 'waiting' | 'playing' | 'ended'
}
```

**Features**:
- ✅ Centralized state for all game data
- ✅ Memoized state updates
- ✅ Prevents unnecessary re-renders

---

## Phaser Game Integration

### PhaserGame.jsx

React wrapper for Phaser 3 instance.

**Props**:
```javascript
{
  parentId: string,          // DOM element ID to render into
  onGameReady: () => void,   // Called when scenes loaded
}
```

**Creates**:
- Phaser game instance
- Initializes BootScene and TugScene
- Provides communication bridge to React via EventBus

---

### BootScene.js

Initial Phaser scene for asset loading.

**Responsibilities**:
- Load sprite sheets for characters
- Load rope texture
- Load audio assets
- Transition to TugScene

**Emits**:
```javascript
EventBus.emit('SCENE_READY', { scene: 'tug' });
```

---

### TugScene.js

Main game rendering scene (Phaser).

**Responsibilities**:
- Render rope physics as visual line
- Animate character pulling motions
- Display current problem text
- Handle input timing visualization

**Key Objects**:
```javascript
{
  rope: RawGraphics,              // Rope visual
  leftCharacter: Sprite,          // Left team player sprite
  rightCharacter: Sprite,         // Right team player sprite
  problemText: Text,              // Problem expression display
}
```

**Listens to Events**:
```javascript
EventBus.on('ROPE_UPDATE', ({ nodes }) => {
  // Update rope visual from physics
});

EventBus.on('ANSWER_RESULT', ({ correct, side }) => {
  // Trigger celebration or error animation
});
```

---

## EventBus Communication

### Pattern: React ↔ Phaser Bridge

React and Phaser scenes communicate through **EventBus** (event emitter).

```javascript
// In React component
import { EventBus } from './game/EventBus.js';

EventBus.emit('ANSWER_SUBMITTED', {
  side: 'left',
  answer: 42
});

// In Phaser scene
EventBus.on('ANSWER_SUBMITTED', ({ side, answer }) => {
  // Handle in game logic
});
```

### Event Types

| Event | Source | Payload | Purpose |
|-------|--------|---------|---------|
| `ANSWER_SUBMITTED` | React | `{side, answer}` | Player submitted answer |
| `ROPE_UPDATE` | Phaser | `{nodes}` | Physics positions to render |
| `PROBLEM_CHANGED` | Phaser | `{side, problem}` | New problem available |
| `CORRECT_ANSWER` | Phaser | `{side}` | Trigger celebration |
| `INCORRECT_ANSWER` | Phaser | `{side}` | Trigger error feedback |
| `GAME_OVER` | Phaser | `{winner}` | Game ended |

---

## Game State Flow

```
Player Enters SetupWizard
    ↓
Player Selects Difficulty + Team Names
    ↓
GameLayout mounts, connects WebSocket
    ↓
Sends SETUP_GAME message to server
    ↓
Server responds GAME_START
    ↓
React updates state (scores, rope, problem)
    ↓
EventBus emits ROPE_UPDATE → Phaser renders
    ↓
[Game Loop: Player answers → EventBus → Network → Server → Response]
    ↓
Server broadcasts GAME_OVER
    ↓
React shows VictoryModal
    ↓
Player clicks "Play Again" → Restart loop
```

---

## Styling & Tailwind Configuration

### Tailwind Setup

**File**: `client/tailwind.config.js`

```javascript
module.exports = {
  content: ['./src/**/*.jsx'],
  theme: {
    extend: {
      colors: {
        glassmorphic: 'rgba(255, 255, 255, 0.1)',
      },
      backdropFilter: {
        xs: 'blur(2px)',
        md: 'blur(8px)',
      },
    },
  },
  plugins: [],
};
```

### Glass Morphism Classes

```html
<div class="backdrop-blur-md bg-white/10 border border-white/20 rounded-lg">
  <!-- Numpad and other glass UI -->
</div>
```

---

## Constants

**File**: `client/src/utils/constants.js`

```javascript
export const WS_URL = 'ws://localhost:3001';  // WebSocket endpoint

export const DIFFICULTY_LEVELS = {
  1: { label: 'Easy', operations: ['add', 'sub'] },
  2: { label: 'Medium', operations: ['add', 'sub', 'mul'] },
  3: { label: 'Hard', operations: ['mul'] },
};

export const GAME_EVENTS = {
  ANSWER_SUBMITTED: 'ANSWER_SUBMITTED',
  ROPE_UPDATE: 'ROPE_UPDATE',
  PROBLEM_CHANGED: 'PROBLEM_CHANGED',
  GAME_OVER: 'GAME_OVER',
  // ... other events
};
```

---

## Input Handling

### Numpad Input Flow

```
User taps Numpad button (0-9)
    ↓
Numpad.jsx calls onInput()
    ↓
GameLayout updates input state
    ↓
Display updates in real-time
    ↓
User taps AnswerButton
    ↓
GameLayout calls sendMessage('ANSWER_SUBMITTED', ...)
    ↓
WebSocket → Server
```

### Problem Answer Submission

```javascript
// In GameLayout or Numpad component
const handleSubmitAnswer = (answer) => {
  sendMessage('ANSWER_SUBMITTED', {
    side: currentPlayerSide,
    answer: Number(answer),
    problemId: currentProblem.id,
    timestamp: Date.now()
  });
};
```

---

## Performance Optimization

### React Optimization

- ✅ Memoized components with `React.memo()`
- ✅ Callback stable with `useCallback()`
- ✅ State updates batched via React 19 automatic batching
- ✅ Lazy-loaded components for routes

### Phaser Optimization

- ✅ Graphics object reused (no recreation each frame)
- ✅ Sprite pooling for animations
- ✅ Use `setDepth()` for z-ordering
- ✅ Disable physics for static objects

### Network Optimization

- ✅ WebSocket message bundling (rope + score in single message)
- ✅ Debounce UI updates to 20Hz tick rate
- ✅ Compress initial state payload

---

## Mobile Responsive Design

### Viewport Configuration

```html
<meta name="viewport" 
      content="width=device-width, initial-scale=1.0, 
               user-scalable=no, maximum-scale=1.0">
```

### Breakpoints (Tailwind)

```javascript
// Custom breakpoints
extend: {
  screens: {
    'portrait': { 'raw': '(orientation: portrait)' },
    'landscape': { 'raw': '(orientation: landscape)' },
  }
}
```

### Responsive Classes

```html
<!-- Hide in portrait, show in landscape -->
<div class="hidden landscape:flex">
  <!-- Numpad visible only in landscape -->
</div>
```

---

## Debugging Tips

### Enable WebSocket Logging

```javascript
// In useWebSocket hook
ws.onmessage = (event) => {
  console.log('[WS] Received:', event.data);
  // ... rest of handler
};
```

### React DevTools

```bash
# Install React DevTools extension for Chrome/Firefox
# Inspect component hierarchy and state
```

### Phaser Debugging

```javascript
// In PhaserGame.jsx or scene
const config = {
  debug: true,
  physics: {
    arcade: {
      debug: true,
      debugShowBody: true,
    }
  }
};
```

---

## Building for Production

### Build Command

```bash
npm run build

# Outputs to: client/dist/
# Minified and optimized
```

### Performance Metrics

- Build size: ~200KB (gzipped)
- Initial load: ~2 seconds
- Time to interactive: ~3 seconds

---

## Troubleshooting

### WebSocket Connection Fails

**Symptom**: `isConnected` always false

**Fixes**:
1. Verify server is running: `npm run dev:server`
2. Check `WS_URL` constant matches server address
3. Check browser console for CORS or connection errors
4. Verify firewall allows port 3001

### Game State Out of Sync

**Symptom**: Client score doesn't match server

**Fixes**:
1. Check network tab for dropped messages
2. Verify `handleAnswer()` is server-authoritative
3. Don't trust client-side calculations

### Rope Physics Choppy

**Symptom**: Rope visuals stutter

**Fixes**:
1. Reduce constraint iterations in RopePhysics (default 8)
2. Check browser performance (DevTools → Performance)
3. Reduce tick rate if necessary (currently 20Hz)

