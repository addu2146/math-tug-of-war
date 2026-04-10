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

// All active game rooms indexed by roomId string
const rooms = new Map();
// Look up which room a WS connection belongs to natively
const connectionRooms = new Map();

function generateRoomId() {
    let id;
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    do {
        id = '';
        for (let i = 0; i < 4; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
    } while (rooms.has(id));
    return id;
}

wss.on('connection', (ws) => {
    console.log('[Server] Client connected');

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
            const { isValid, data, error } = validateClientPayload(rawString);

            if (!isValid) {
                console.warn('[Server] Payload validation error:', error);
                return; 
            }

            const msgType = data.type;
            let room = connectionRooms.get(ws);

            switch (msgType) {
                case 'CREATE_ROOM': {
                    const roomId = generateRoomId();
                    const config = data.payload || {};
                    config.isNetwork = true;
                    room = new GameRoom(roomId, config);
                    room.addPlayer(ws, 'left');
                    rooms.set(roomId, room);
                    connectionRooms.set(ws, room);
                    
                    ws.send(JSON.stringify({
                        type: 'ROOM_CREATED',
                        payload: { roomId, config: room.getPlayersState() }
                    }));
                    console.log(`[Server] Network Room ${roomId} created`);
                    break;
                }

                case 'JOIN_ROOM': {
                    const { roomId } = data.payload;
                    const targetRoom = rooms.get(roomId.toUpperCase());
                    
                    if (!targetRoom) {
                        ws.send(JSON.stringify({ type: 'ROOM_ERROR', payload: { message: 'Room not found' } }));
                        return;
                    }
                    if (targetRoom.isFull) {
                        ws.send(JSON.stringify({ type: 'ROOM_ERROR', payload: { message: 'Room is full' } }));
                        return;
                    }

                    targetRoom.addPlayer(ws, 'right');
                    connectionRooms.set(ws, targetRoom);
                    
                    ws.send(JSON.stringify({
                        type: 'ROOM_JOINED',
                        payload: { roomId: targetRoom.id }
                    }));
                    console.log(`[Server] Client joined Network Room ${targetRoom.id}`);
                    
                    // Host and Guest are now both in, start game
                    targetRoom.startGame();
                    break;
                }

                case 'RECONNECT': {
                    const { roomId, role } = data.payload;
                    const targetRoom = rooms.get(roomId);
                    if (!targetRoom || !targetRoom.gameActive || targetRoom.players[role].ws) {
                        return; // Room gone or slot already filled
                    }

                    targetRoom.addPlayer(ws, role);
                    connectionRooms.set(ws, targetRoom);

                    if (targetRoom.disconnectTimeouts && targetRoom.disconnectTimeouts[role]) {
                        clearTimeout(targetRoom.disconnectTimeouts[role]);
                        targetRoom.disconnectTimeouts[role] = null;
                        console.log(`[Server] ${role} player reconnected to Room ${roomId}`);
                    }

                    // Resend full current state so the reconnected client can resume seamlessly
                    ws.send(JSON.stringify({
                        type: 'GAME_START',
                        payload: {
                            teamNames: targetRoom.teamNames,
                            timeRemaining: targetRoom.timeRemaining,
                            ropeNodes: targetRoom.rope.getNodePositions(),
                            players: targetRoom.getPlayersState(),
                            problems: {
                                left: targetRoom.getProblemPayload('left'),
                                right: targetRoom.getProblemPayload('right'),
                            },
                        },
                    }));
                    break;
                }

                case 'SETUP_GAME': {
                    // Local Play Mode
                    const roomId = 'LOCAL_' + Math.random().toString(36).substr(2, 6);
                    const config = data.payload || {};
                    config.isNetwork = false;
                    room = new GameRoom(roomId, config);
                    room.addPlayer(ws, 'local');
                    rooms.set(roomId, room);
                    connectionRooms.set(ws, room);
                    room.startGame();
                    console.log('[Server] Local Game started with config:', config);
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
        const room = connectionRooms.get(ws);
        if (room) {
            let role = null;
            if (room.players.left.ws === ws) role = 'left';
            else if (room.players.right.ws === ws) role = 'right';

            room.removePlayerByWs(ws);

            if (room.isNetwork && room.gameActive && role) {
                // Introduce a 15-second grace period for the player to reconnect
                if (!room.disconnectTimeouts) room.disconnectTimeouts = {};
                
                room.disconnectTimeouts[role] = setTimeout(() => {
                    const currentRoom = rooms.get(room.id);
                    if (currentRoom && currentRoom.gameActive && !currentRoom.players[role].ws) {
                        const remainingWs = role === 'left' ? currentRoom.players.right.ws : currentRoom.players.left.ws;
                        if (remainingWs && remainingWs.readyState === 1) {
                             remainingWs.send(JSON.stringify({
                                 type: 'OPPONENT_DISCONNECTED'
                             }));
                        }
                        currentRoom.destroy();
                        rooms.delete(currentRoom.id);
                    }
                }, 15000); // 15 seconds grace period
                
            } else if (!room.isFull && !room.gameActive) { // No players left or only 1 left in setup phase
                // If everyone leaves early, scrap the room
                if (!room.players.left.ws && !room.players.right.ws) {
                    room.destroy();
                    rooms.delete(room.id);
                }
            }
            connectionRooms.delete(ws);
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

