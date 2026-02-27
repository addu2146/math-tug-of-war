/**
 * BootScene — Preloads team character sprites, then transitions to TugScene.
 */

import { Scene } from 'phaser';

export class BootScene extends Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        this.load.image('blue_team', '/assets/blue_team.png');
        this.load.image('red_team', '/assets/red_team.png');
    }

    create() {
        this.scene.start('TugScene');
    }
}
