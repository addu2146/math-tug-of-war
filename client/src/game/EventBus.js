/**
 * Global EventBus for React <-> Phaser communication.
 * 
 * Per @phaser-react-bridge skill:
 * - React components MUST NOT call Phaser scene methods directly.
 * - Phaser scenes MUST NOT manipulate DOM elements.
 * - All cross-boundary state changes must be emitted through this bus.
 */

import { Events } from 'phaser';
import { GAME_EVENTS } from '../utils/constants.js';

export const EventBus = new Events.EventEmitter();

// Re-export events for convenience
export { GAME_EVENTS };
