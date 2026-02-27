---
name: websocket-authoritative-server
description: Use this skill when establishing real-time WebSockets communication, managing server state, and preventing client-side cheating.
---

# Operational Rules
* The client application never dictates the canonical game state. 
* The client only transmits intent-based actions (e.g., `{ type: "ANSWER_SUBMITTED", payload: 12 }`). 
* The Node.js server maintains the absolute canonical state, validates mathematical answers, calculates physics vectors, and broadcasts `STATE_UPDATE` payloads to all connected peers at a fixed, deterministic tick rate.

# Learning Materials & Documentation
* Advanced authoritative server networking design patterns
* WebSocket payload framing standards
* Latency compensation mechanism documentation
