/**
 * Strict validator for incoming WebSocket messages from the client.
 * * RULES FOR AGENT:
 * - All incoming client messages must pass through this validator.
 * - Never trust client payload data directly in game state logic.
 * - The client only transmits intent (e.g., 'ANSWER_SUBMITTED').
 */

const VALID_INTENTS = new Set([
    'ANSWER_SUBMITTED',
    'PLAYER_INPUT_START',
    'PLAYER_INPUT_END'
]);

export function validateClientPayload(rawMessage) {
    try {
        const payload = JSON.parse(rawMessage);

        if (!payload || typeof payload !== 'object') {
            return { isValid: false, error: 'Payload must be a JSON object' };
        }

        if (!payload.type || !VALID_INTENTS.has(payload.type)) {
            return { isValid: false, error: `Invalid or unauthorized action type: ${payload.type}` };
        }

        return { 
            isValid: true, 
            data: {
                type: payload.type,
                value: payload.value 
            } 
        };

    } catch (error) {
        return { isValid: false, error: 'Malformed JSON payload' };
    }
}
