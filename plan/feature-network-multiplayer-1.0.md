---
goal: Add Network Multiplayer feature via Room Codes and QR Codes
version: 1.0
date_created: 2026-04-10
last_updated: 2026-04-10
owner: AI Agent
status: 'Completed'
tags: [`feature`, `multiplayer`, `network`]
---

# Introduction

![Status: Completed](https://img.shields.io/badge/status-Completed-brightgreen)

This implementation plan details the steps required to introduce a network multiplayer feature into the "Math Tug-of-War" game. Currently, the game uses a "Same-Screen Multi-Touch" setup where both teams use a single device. The goal is to allow two different classrooms or schools to play against each other on separate devices via WebSockets, using a Room Code or a QR code.

## 1. Requirements & Constraints

- **REQ-001**: Support two separate browser clients joining the same game instance over WebSockets.
- **REQ-002**: Generate a unique 4-6 character alphanumeric Room Code for the host.
- **REQ-003**: Provide a scannable QR Code that contains the game URL with the Room Code appended (e.g., `?room=ABCD`).
- **REQ-004**: The Host configures the game (Difficulty, Operations) and defaults to the "Left" side. The Guest joins and assumes the "Right" side.
- **REQ-005**: Automatically route users to the correct room if they land on the URL with a room parameter.
- **CON-001**: Network latency must not severely disrupt the physics simulation; state should remain authoritative on the server.
- **CON-002**: The existing Same-Screen Multi-Touch mode must remain fully functional as an optional mode.
- **GUD-001**: UI buttons must remain large and accessible according to existing kid-friendly standards.
- **PAT-001**: Retain the `useGameState` + `useWebSocket` EventBus messaging pattern.

## 2. Implementation Steps

### Implementation Phase 1: Server Room Management

- GOAL-001: Refactor the server to manage Room IDs and separate websocket connections for Left and Right clients.

| Task     | Description           | Completed | Date       |
| -------- | --------------------- | --------- | ---------- |
| TASK-001 | In `server/index.js`, refactor `rooms` Map to use `roomId` (string) as keys rather than the `ws` object. | ✅ | 2026-04-10 |
| TASK-002 | Implement logic in `server/index.js` to handle `CREATE_ROOM` and `JOIN_ROOM` messages, generating short alphanumeric IDs. | ✅ | 2026-04-10 |
| TASK-003 | Update `GameRoom.js` to store connection objects for both `left` and `right` players separately (`this.players[side].ws`). | ✅ | 2026-04-10 |
| TASK-004 | Modify `GameRoom.js` `send()` method to broadcast the payload to all connected WebSockets in the room. | ✅ | 2026-04-10 |
| TASK-005 | Update the server validation pipeline (`PayloadValidator.js`) to whitelist the new `CREATE_ROOM` and `JOIN_ROOM` types. | ✅ | 2026-04-10 |

### Implementation Phase 2: Client Menu & Setup

- GOAL-002: Update the Landing Page and Setup Wizard to branch into "Local" or "Network" modes.

| Task     | Description           | Completed | Date       |
| -------- | --------------------- | --------- | ---------- |
| TASK-006 | Update `app.jsx` / `LandingPage.jsx` to present options for "Local Play", "Create Network Game", and "Join Network Game". | ✅ | 2026-04-10 |
| TASK-007 | Create a generic input in "Join Network Game" where users can type a 4-6 letter Room Code. | ✅ | 2026-04-10 |
| TASK-008 | Create a generic `WaitingRoom.jsx` UI to display the generated Room Code and QR Code to the Host. | ✅ | 2026-04-10 |
| TASK-009 | Modify `SetupWizard.jsx` so that if "Network" mode is active, it only prompts the Host for the Left Team name. | ✅ | 2026-04-10 |

### Implementation Phase 3: Client Connection & Play

- GOAL-003: Lock UI interactions depending on role and orchestrate the countdown.

| Task     | Description           | Completed | Date       |
| -------- | --------------------- | --------- | ---------- |
| TASK-010 | Add logic to `App.jsx` to scan URL parameters on load. If `?room=XYZ` is present, skip the menu and join automatically. | ✅ | 2026-04-10 |
| TASK-011 | Update `useGameState.js` and `GameLayout.jsx` to store the active client's role (`local`, `host/left`, `guest/right`). | ✅ | 2026-04-10 |
| TASK-012 | In `GameLayout.jsx`, disable pointer events or explicitly hide the `PlayerPanel` that does NOT belong to the active network client. | ✅ | 2026-04-10 |
| TASK-013 | Ensure the `GameRoom` waits until the guest joins before emitting `GAME_START` to trigger the synchronized countdown. | ✅ | 2026-04-10 |

## 3. Alternatives

- **ALT-001**: WebRTC Peer-to-Peer connection instead of Server-Authoritative WebSocket. *Rejected because we already have a robust Node.js WebSocket game loop processing rope physics securely to prevent client manipulation.*
- **ALT-002**: Separate screens for each player but render the rope visually separated. *Rejected because the shared rope is the main visual element. Keeping the full view for both screens ensures maximum engagement.*

## 4. Dependencies

- **DEP-001**: Add a QR Code generation library to the frontend, such as `qrcode.react`.
- **DEP-002**: Standard JavaScript `URLSearchParams` to extract room codes from the URL natively.

## 5. Files

- **FILE-001**: `server/index.js`
- **FILE-002**: `server/game/GameRoom.js`
- **FILE-003**: `server/network/PayloadValidator.js`
- **FILE-004**: `server/network/MessageTypes.js`
- **FILE-005**: `client/src/App.jsx`
- **FILE-006**: `client/src/components/LandingPage.jsx`
- **FILE-007**: `client/src/components/SetupWizard.jsx`
- **FILE-008**: `client/src/components/GameLayout.jsx`
- **FILE-009**: `client/src/components/WaitingRoom.jsx` (New)
- **FILE-010**: `client/src/hooks/useGameState.js`
- **FILE-011**: `client/package.json`

## 6. Testing

- **TEST-001**: End-to-End test of the Host creating a room, ensuring the Room Code generated is strictly 4-6 chars.
- **TEST-002**: Unit test the guest joining workflow, validating that passing the correct code assigns the `right` role.
- **TEST-003**: Verify UI restriction: Host can only input `left` answers, Guest can only input `right` answers.
- **TEST-004**: Re-test the original "Same-Screen" flow to verify no regressions in local play configuration.
- **TEST-005**: Network disruption simulation (if client disconnects, game gracefully pauses or halts and notifies the remaining client).

## 7. Risks & Assumptions

- **RISK-001**: QR code library bloats the client bundle. *Mitigation: Standard lightweight libraries like `qrcode.react` are minimal and efficient.*
- **RISK-002**: Network latency causes asynchronous countdown finishes. *Mitigation: Embed a server timestamp in the `GAME_START` payload if necessary to sync countdowns.*
- **ASSUMPTION-001**: The hosting server (e.g., Heroku or a container) has WebSocket sticky sessions or only uses a single instance to map server room states in memory.

## 8. Related Specifications / Further Reading

- [Architecture Document](../docs/ARCHITECTURE.md)
- [Client Document](../docs/CLIENT.md)
- [Server Document](../docs/SERVER.md)
