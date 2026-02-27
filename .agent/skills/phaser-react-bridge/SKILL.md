---
name: phaser-react-bridge
description: Use this skill exclusively when integrating a Phaser 3 game instance within a React UI application. It prevents double-mounting and dictates EventBus usage.
---

# Operational Rules
* Do not manipulate the DOM directly from within the Phaser scene context. 
* Emit all state changes via `EventBus.emit()` and actively listen within React `useEffect` hooks. 
* Ensure the Phaser game instance is explicitly destroyed upon the React component unmount lifecycle phase to prevent WebGL canvas duplication and memory exhaustion.

# Learning Materials & Documentation
* Official `@phaserjs/template-react` documentation
* Vite bundler configuration guides
* Advanced React `useEffect` cleanup pattern tutorials
