/**
 * Phaser 3 Game config — white background, fits inside CenterPanel card.
 */

import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TugScene } from './scenes/TugScene.js';

export function createGameConfig(parentId) {
    return {
        type: Phaser.AUTO,
        parent: parentId,
        transparent: true,
        width: window.innerWidth,
        height: window.innerHeight,
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
        },
        scene: [BootScene, TugScene],
        render: {
            antialias: true,
            pixelArt: false,
        },
    };
}
