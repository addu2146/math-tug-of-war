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

        // Epic fantasy environment textures
        this.load.image('wall_stone', '/assets/textures_fantasy/PNG/wall_brick_stone_center.png');
        this.load.image('wall_banner', '/assets/textures_fantasy/PNG/wall_brick_stone_center_banner.png');
        this.load.image('floor_dirt', '/assets/textures_fantasy/PNG/floor_ground_dirt.png');

        // Modular Characters
        this.load.image('tint1_head', '/assets/characters/PNG/Skin/Tint 1/tint1_head.png');
        this.load.image('tint1_hand', '/assets/characters/PNG/Skin/Tint 1/tint1_hand.png');
        this.load.image('face1', '/assets/characters/PNG/Face/Completes/face1.png');

        // Blue Team
        this.load.image('blueShirt1', '/assets/characters/PNG/Shirts/Blue/blueShirt1.png');
        this.load.image('blueArm_long', '/assets/characters/PNG/Shirts/Blue/blueArm_long.png');
        this.load.image('pantsBlue_long', '/assets/characters/PNG/Pants/Blue 1/pantsBlue1_long.png');
        this.load.image('blueShoe1', '/assets/characters/PNG/Shoes/Blue/blueShoe1.png');

        // Red Team
        this.load.image('redShirt1', '/assets/characters/PNG/Shirts/Red/redShirt1.png');
        this.load.image('redArm_long', '/assets/characters/PNG/Shirts/Red/redArm_long.png');
        this.load.image('pantsRed_long', '/assets/characters/PNG/Pants/Red/pantsRed_long.png');
        this.load.image('redShoe1', '/assets/characters/PNG/Shoes/Red/redShoe1.png');
    }

    create() {
        this.scene.start('TugScene');
    }
}
