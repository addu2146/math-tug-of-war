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
            const msg = JSON.parse(rawMessage.toString());

            switch (msg.type) {
                case 'SETUP_GAME': {
                    // Create a new room with the game config from the setup wizard
                    room = new GameRoom(ws, msg.payload || {});
                    rooms.set(ws, room);
                    room.startGame();
                    console.log('[Server] Game started with config:', msg.payload);
                    break;
                }

                case 'ANSWER_SUBMITTED': {
                    if (room) {
                        room.handleAnswer(msg.side, msg.answer);
                    }
                    break;
                }

                case 'RAGE_QUIT': {
                    if (room) {
                        room.handleRageQuit(msg.side);
                    }
                    break;
                }

                case 'PLAY_AGAIN': {
                    if (room) {
                        room.resetAndRestart(msg.payload || {});
                    }
                    break;
                }

                default:
                    console.warn('[Server] Unknown message type:', msg.type);
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

