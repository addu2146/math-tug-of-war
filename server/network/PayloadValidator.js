/**
 * Strict validator for incoming WebSocket messages from the client.
 * 
 * Per @websocket-authoritative-server skill:
 * - All incoming client messages must pass through this validator.
 * - Never trust client payload data directly in game state logic.
 * - The client only transmits intent (e.g., 'ANSWER_SUBMITTED').
 */

import { CLIENT_MESSAGES } from './MessageTypes.js';

const VALID_INTENTS = new Set(Object.values(CLIENT_MESSAGES));

/**
 * Validates and sanitizes a raw WebSocket message.
 * 
 * @param {string} rawMessage - Raw string from WebSocket
 * @returns {{ isValid: boolean, data?: object, error?: string }}
 */
export function validateClientPayload(rawMessage) {
    try {
        const payload = JSON.parse(rawMessage);

        if (!payload || typeof payload !== 'object') {
            return { isValid: false, error: 'Payload must be a JSON object' };
        }

        if (!payload.type || !VALID_INTENTS.has(payload.type)) {
            return { isValid: false, error: `Invalid or unauthorized action type: ${payload.type}` };
        }

        // Sanitize: only pass through known fields
        const sanitized = {
            type: payload.type,
            timestamp: typeof payload.timestamp === 'number' ? payload.timestamp : Date.now(),
        };

        // Type-specific payload extraction
        if (payload.type === CLIENT_MESSAGES.ANSWER_SUBMITTED) {
            if (typeof payload.answer !== 'number') {
                return { isValid: false, error: 'ANSWER_SUBMITTED requires a numeric "answer" field' };
            }
            sanitized.answer = payload.answer;
            sanitized.problemId = typeof payload.problemId === 'string' ? payload.problemId : '';
        } else if (payload.type === CLIENT_MESSAGES.SETUP_GAME || payload.type === CLIENT_MESSAGES.PLAY_AGAIN || payload.type === CLIENT_MESSAGES.CREATE_ROOM) {
            if (payload.payload && typeof payload.payload === 'object') {
                sanitized.payload = payload.payload;
            } else {
                sanitized.payload = {};
            }
        } else if (payload.type === CLIENT_MESSAGES.JOIN_ROOM) {
            if (typeof payload.payload !== 'object' || typeof payload.payload.roomId !== 'string') {
                return { isValid: false, error: 'JOIN_ROOM requires a payload object with a "roomId" string' };
            }
            sanitized.payload = payload.payload;
        }

        return { isValid: true, data: sanitized };

    } catch (error) {
        return { isValid: false, error: 'Malformed JSON payload' };
    }
}
