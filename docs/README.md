# Math Tug-of-War — Project Documentation

## Overview

**Math Tug-of-War** is an engaging, same-screen multiplayer educational game designed to improve mathematical skills while providing a competitive and entertaining experience. Two players solve math problems in real-time to pull their side of the rope and beat their opponent.

### Key Features

- **Same-Screen Multiplayer**: Two players compete on the same device using shared input controls
- **Progressive Difficulty**: Three difficulty levels (Easy, Medium, Hard) with varying math operations
- **Real-Time Physics**: Realistic rope physics with verlet integration for authentic gameplay
- **Responsive Design**: Mobile-friendly UI with landscape orientation support
- **Glassmorphic UI**: Modern, translucent numpad design for better visual appeal
- **Character Customization**: Players can select custom character appearances personalized
- **Sound Design**: Engaging background music with procedurally-driven gameplay audio
- **Educational Focus**: Covers addition, subtraction, and multiplication with customizable difficulty progression

---

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation & Setup

```bash
# Root directory
npm run install:all

# Start development servers
npm run dev:server   # Terminal 1: Server on port 3001
npm run dev:client   # Terminal 2: Client on port 5173
```

### Production Build & Run

```bash
# Build the client (generates dist folder)
npm run build

# Run the production server
npm run start
```

The game will be served at `http://localhost:3001` with the server handling both WebSocket connections and static file serving.

---

## Project Structure

```
math-tug-of-war/
├── server/                    # Express server + WebSocket
│   ├── index.js              # Main server entry point
│   ├── game/                 # Game logic layer
│   │   ├── GameRoom.js       # Game session management
│   │   ├── PlayerState.js    # Per-player state model
│   │   └── RopePhysics.js    # Verlet physics engine
│   ├── math/                 # Math problem generation
│   │   ├── DifficultyConfig.js
│   │   └── ProblemGenerator.js
│   └── network/              # WebSocket protocol
│       ├── MessageTypes.js
│       └── PayloadValidator.js
├── client/                    # React + Phaser frontend
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── components/       # React UI components
│   │   ├── game/             # Phaser game scenes
│   │   ├── hooks/            # Custom React hooks
│   │   └── utils/            # Constants & helpers
│   └── package.json
├── docs/                      # Documentation
│   ├── README.md             # This file
│   ├── ARCHITECTURE.md       # System design
│   ├── SERVER.md             # Server API reference
│   ├── CLIENT.md             # Client components
│   ├── SECURITY.md           # Security review
│   └── INSTALLING-DEPENDENCIES.md
└── package.json              # Root workspace config
```

---

## Technology Stack

### Backend
- **Express.js** — HTTP server and static file serving
- **ws (WebSocket)** — Real-time bidirectional communication
- **mathjs** — Safe mathematical expression evaluation
- **Node.js** — Runtime environment

### Frontend
- **React 19.2.4** — UI component framework
- **Phaser 3.90** — Game rendering and physics
- **Vite** — Build tooling and development server
- **Tailwind CSS** — Utility-first styling
- **WebSocket API** — Client-side socket communication

---

## Core Gameplay Flow

1. **Landing Page** — Player selects game difficulty and configures teams
2. **Character Selection** — Each player customizes their character appearance
3. **Setup Wizard** — Final confirmation of game parameters
4. **Game Start** — Both players receive initial math problems
5. **Problem Solving** — Players answer problems using the glassmorphic numpad
6. **Rope Physics** — Correct answers pull the rope toward that team
7. **Victory** — First team to pull rope to their side wins
8. **Result Screen** — Winner announcement with option to play again

---

## Communication Protocol

All client-server communication is managed through **WebSocket** with strict message validation:

```javascript
// Client → Server message structure
{
  type: 'ANSWER_SUBMITTED',        // Message intent
  side: 'left' | 'right',           // Player side
  answer: <number>,                 // Numeric answer
  problemId: <string>,              // Problem reference
  timestamp: <number>               // Client timestamp
}

// Server → Client response
{
  type: 'ANSWER_RESULT',
  payload: {
    side: 'left' | 'right',
    correct: <boolean>,
    correctAnswer: <number>,
    score: <number>,
    streak: <number>
  }
}
```

See [SERVER.md](SERVER.md) for complete API reference.

---

## Security Considerations

- ✅ **Payload Size Limits** — Maximum 5KB per WebSocket message
- ✅ **Input Validation** — All client data validated server-side (zero trust)
- ✅ **Prototype Pollution Prevention** — Side parameter strictly whitelisted
- ✅ **Configuration Hardening** — Game duration and difficulty bounds enforced
- ✅ **Safe Math Evaluation** — mathjs.evaluate() instead of eval()
- ✅ **XSS Protection** — React auto-escaping, no dangerouslySetInnerHTML

See [SECURITY.md](SECURITY.md) for detailed security review.

---

## Development Guidelines

### Running Tests

Currently, no automated tests exist. Testing is manual through browser play testing.

```bash
# Manual testing checklist in both landscapes
- Easy difficulty: addition/subtraction
- Medium difficulty: all operations
- Hard difficulty: multiplication only
- Negative result prevention (subtraction at Easy level)
- Team name character limit (max 30 chars)
- Rope victory condition at threshold ±180px
```

### Code Style & Standards

- **JavaScript**: ES6 modules, async/await
- **React**: Functional components, hooks only
- **Naming**: camelCase for variables, snake_case for constants
- **Comments**: JSDoc for public APIs, inline comments for complex logic

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

---

## Performance Notes

- **Tick Rate**: Game updates at 20Hz (50ms intervals)
- **WebSocket Messages**: Validated and rate-limited at protocol level
- **Memory**: Payload size capped at 5KB to prevent DoS
- **Physics**: Verlet integration with 8 constraint iterations per frame

---

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Build client: `npm run build`
- [ ] Verify static files serve from `client/dist`
- [ ] Test WebSocket connections under load
- [ ] Monitor server memory for leaks
- [ ] Enable CORS for trusted origins only
- [ ] Configure firewall to rate-limit WebSocket connections

### Environment Variables

```bash
PORT=3001                # Server port (default: 3001)
HOST=0.0.0.0            # Server host (default: 0.0.0.0)
NODE_ENV=production     # Production mode
```

---

## Future Enhancements

Planned features are tracked in [Things_to_add.md](../Things_to_add.md):

- Simple word problems for deeper education
- Multi-school cross-network gameplay
- Customizable episodes/subjects
- Advanced analytics and progress tracking
- Accessibility improvements

---

## Support & Contact

For bug reports, feature requests, or questions:
- Open an issue on the repository
- Contact: [Developer contact info — to be added]

---

## License

[License information — to be added]

---

**Last Updated**: April 10, 2026
**Current Version**: 1.0.0
