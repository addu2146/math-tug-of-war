/**
 * useGameState — Manages both players' state from a single server connection.
 * Bridges server events to React UI and to Phaser via EventBus.
 */

import { useReducer, useCallback } from 'react';
import { EventBus } from '../game/EventBus.js';
import { GAME_EVENTS } from '../utils/constants.js';

const initialState = {
    phase: 'setup', // setup | playing | gameOver
    teamNames: { left: 'Team 1', right: 'Team 2' },
    timeRemaining: 120,
    progress: 0,
    winner: null,
    winReason: null,
    players: {
        left: { score: 0, streak: 0 },
        right: { score: 0, streak: 0 },
    },
    problems: {
        left: null,
        right: null,
    },
    answerResults: {
        left: null,
        right: null,
    },
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'GAME_START':
            return {
                ...state,
                phase: 'playing',
                teamNames: action.payload.teamNames || state.teamNames,
                timeRemaining: action.payload.timeRemaining,
                players: action.payload.players,
                problems: action.payload.problems,
                answerResults: { left: null, right: null },
                winner: null,
            };

        case 'NEW_PROBLEM':
            return {
                ...state,
                problems: {
                    ...state.problems,
                    [action.payload.side]: action.payload.problem,
                },
                answerResults: {
                    ...state.answerResults,
                    [action.payload.side]: null,
                },
            };

        case 'ANSWER_RESULT':
            return {
                ...state,
                players: {
                    ...state.players,
                    [action.payload.side]: {
                        score: action.payload.score,
                        streak: action.payload.streak,
                    },
                },
                answerResults: {
                    ...state.answerResults,
                    [action.payload.side]: action.payload.correct ? 'correct' : 'incorrect',
                },
            };

        case 'STATE_UPDATE':
            return {
                ...state,
                progress: action.payload.progress,
                players: action.payload.players,
                timeRemaining: action.payload.timeRemaining,
            };

        case 'GAME_OVER':
            return {
                ...state,
                phase: 'gameOver',
                winner: action.payload.winner,
                winReason: action.payload.reason,
                players: action.payload.players,
                teamNames: action.payload.teamNames || state.teamNames,
            };

        case 'RESET':
            return { ...initialState };

        case 'CLEAR_ANSWER_RESULT':
            return {
                ...state,
                answerResults: {
                    ...state.answerResults,
                    [action.side]: null,
                },
            };

        default:
            return state;
    }
}

export function useGameState() {
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const handleServerMessage = useCallback((data) => {
        dispatch(data);

        // Bridge to Phaser
        if (data.type === 'STATE_UPDATE' || data.type === 'GAME_START') {
            EventBus.emit(GAME_EVENTS.ROPE_UPDATE, data.payload);
        }
        if (data.type === 'GAME_START') {
            EventBus.emit(GAME_EVENTS.GAME_START, data.payload);
        }
        if (data.type === 'GAME_OVER') {
            EventBus.emit(GAME_EVENTS.GAME_OVER, data.payload);
        }
    }, []);

    const clearAnswerResult = useCallback((side) => {
        dispatch({ type: 'CLEAR_ANSWER_RESULT', side });
    }, []);

    const resetState = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return { state, handleServerMessage, clearAnswerResult, resetState };
}
