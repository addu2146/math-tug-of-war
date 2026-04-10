/**
 * Shared constants between React UI and game logic.
 */

// WebSocket connection — auto-detect host for production, but use port 3001 if we're on the Vite dev port (5173)
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const hostname = window.location.hostname;
const isDev = window.location.port === '5173' || hostname === 'localhost' || hostname === '127.0.0.1';

export const WS_URL = isDev
    ? `ws://${hostname}:3001`
    : `${wsProtocol}//${window.location.host}`;

// Server message types (mirrors server/network/MessageTypes.js)
export const SERVER_MESSAGES = {
    PLAYER_ASSIGNED: 'PLAYER_ASSIGNED',
    WAITING_FOR_OPPONENT: 'WAITING_FOR_OPPONENT',
    GAME_START: 'GAME_START',
    NEW_PROBLEM: 'NEW_PROBLEM',
    ANSWER_RESULT: 'ANSWER_RESULT',
    STATE_UPDATE: 'STATE_UPDATE',
    ROPE_UPDATE: 'ROPE_UPDATE',
    GAME_OVER: 'GAME_OVER',
    OPPONENT_DISCONNECTED: 'OPPONENT_DISCONNECTED',
};

// Client message types
export const CLIENT_MESSAGES = {
    ANSWER_SUBMITTED: 'ANSWER_SUBMITTED',
    PLAYER_READY: 'PLAYER_READY',
};

// EventBus events (Phaser <-> React bridge)
export const GAME_EVENTS = {
    ROPE_UPDATE: 'rope-update',
    GAME_START: 'game-start',
    GAME_OVER: 'game-over',
    PHASER_READY: 'phaser-ready',
};

// Game visual constants
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const VICTORY_THRESHOLD = 150;
