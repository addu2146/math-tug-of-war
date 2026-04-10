/**
 * Server Entry Point — Express HTTP + WebSocket.
 * 
 * Redesigned for SAME-SCREEN multi-touch: a single WebSocket connection
 * manages both players. The client sends `side: 'left'|'right'` with each action.
 *
 * In production, also serves the built Vite client from ../client/dist.
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import { GameRoom } from './game/GameRoom.js';
import { validateClientPayload } from './network/PayloadValidator.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const app = express();
app.use(cors());
app.use(express.json());

// --- Serve built client in production ---
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// One room per WebSocket connection (same-screen local play)
const rooms = new Map();

wss.on('connection', (ws) => {
    console.log('[Server] Client connected');

    let room = null;

    ws.on('message', (rawMessage) => {
        try {
            const rawString = rawMessage.toString();
            
            // Limit payload size to prevent DoS
            if (rawString.length > 5120) {
                console.warn('[Server] Payload Too Large');
                return ws.close(1009, 'Payload Too Large');
            }

            // Parse to get root attributes like side and raw payload
            let parsed;
            try {
                parsed = JSON.parse(rawString);
            } catch {
                console.warn('[Server] Error parsing raw JSON');
                return;
            }

            // Validate that side is either 'left' or 'right'
            if (parsed.side && parsed.side !== 'left' && parsed.side !== 'right') {
                console.warn('[Server] Invalid side:', parsed.side);
                return;
            }

            // Use the strict Payload Validator for the inner event payload 
            // Note: Our setup expects parsed.type vs payload.type so let's sanitize manually or adapt validator
            // We pass rawString to validator to verify it acts on correct intent names
            const { isValid, data, error } = validateClientPayload(rawString);

            if (!isValid) {
                console.warn('[Server] Payload validation error:', error);
                return; 
            }

            const msgType = data.type;

            switch (msgType) {
                case 'SETUP_GAME': {
                    // Create a new room with the game config from the setup wizard
                    room = new GameRoom(ws, data.payload || {});
                    rooms.set(ws, room);
                    room.startGame();
                    console.log('[Server] Game started with config:', data.payload);
                    break;
                }

                case 'ANSWER_SUBMITTED': {
                    if (room) {
                        room.handleAnswer(parsed.side, data.answer);
                    }
                    break;
                }

                case 'RAGE_QUIT': {
                    if (room) {
                        room.handleRageQuit(parsed.side);
                    }
                    break;
                }

                case 'PLAY_AGAIN': {
                    if (room) {
                        room.resetAndRestart(data.payload || {});
                    }
                    break;
                }

                default:
                    console.warn('[Server] Unknown message type:', msgType);
            }
        } catch (err) {
            console.error('[Server] Error parsing message:', err.message);
        }
    });

    ws.on('close', () => {
        console.log('[Server] Client disconnected');
        if (room) {
            room.destroy();
            rooms.delete(ws);
        }
    });

    ws.on('error', (err) => {
        console.error('[Server] WS error:', err.message);
    });
});

// --- SPA catch-all: serve index.html for any non-API route ---
app.get('*path', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
});

const HOST = process.env.HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
    console.log(`
  ╔══════════════════════════════════════════╗
  ║   🎮 Math Tug-of-War Server             ║
  ║   HOST: ${HOST.padEnd(5, ' ')}                             ║
  ║   PORT: ${PORT.toString().padEnd(5, ' ')}                            ║
  ║   Mode: Same-Screen Multi-Touch         ║
  ╚══════════════════════════════════════════╝
  `);
});

