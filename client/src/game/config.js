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
        backgroundColor: '#fdfdfd',
        width: 600,
        height: 400,
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
