/**
 * Typed WebSocket message constants.
 * Prevents typo-driven bugs across client and server.
 */

// Client → Server (intent-only messages)
export const CLIENT_MESSAGES = {
    ANSWER_SUBMITTED: 'ANSWER_SUBMITTED',
    PLAYER_READY: 'PLAYER_READY',
    RAGE_QUIT: 'RAGE_QUIT',
    SETUP_GAME: 'SETUP_GAME',
    PLAY_AGAIN: 'PLAY_AGAIN',
};

// Server → Client (authoritative state broadcasts)
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
