import { Events } from 'phaser';

/**
 * Global EventBus strictly for React <-> Phaser communication.
 * * RULES FOR AGENT:
 * - React components MUST NOT call Phaser scene methods directly.
 * - Phaser scenes MUST NOT manipulate DOM elements.
 * - All cross-boundary state changes must be emitted through this bus.
 */
export const EventBus = new Events.EventEmitter();

// Common Event Constants to prevent typo-driven bugs
export const GAME_EVENTS = {
    PHASER_READY: 'phaser-ready',
    SCORE_UPDATED: 'score-updated',
    UI_BUTTON_CLICKED: 'ui-button-clicked',
    SCENE_TRANSITION: 'scene-transition'
};
