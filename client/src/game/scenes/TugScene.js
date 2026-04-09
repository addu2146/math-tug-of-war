/**
 * TugScene — 3D braided rope with verlet-chain physics rendering.
 *
 * Receives 21 node positions from the server every tick and renders them
 * as a twin-strand braided rope with shading, highlight, and knot texture.
 * Rope endpoints connect directly to character hand positions — no gap.
 *
 * Per @phaser-react-bridge: no DOM manipulation, all data via EventBus.
 */

import { Scene } from 'phaser';
import { EventBus, GAME_EVENTS } from '../EventBus.js';

/* ── Colour palette ─────────────────────────────────────────────── */
const ROPE_BASE = 0x9E7B2F;
const ROPE_DARK = 0x5C4415;
const ROPE_LIGHT = 0xD4B65A;
const ROPE_SHADOW = 0x3A2A0A;
const FLAG_RED = 0xD32F2F;
const CENTER_LINE = 0xAAAAAA;

/* ── Tuning ──────────────────────────────────────────────────────── */
const STRAND_OFFSET = 3;     // half-gap between the two braid strands
const BRAID_PERIOD = 50;    // px between braid cross-overs
const KNOT_SPACING = 80;    // px between decorative knot wraps
const ROPE_WIDTH = 5;     // each strand thickness
const SHADOW_WIDTH = 12;    // shadow layer width
const SPLINE_SAMPLES = 120;   // interpolated points per rope
const HAND_REACH = 55;    // px the rope extends into the character sprite

export class TugScene extends Scene {
    constructor() {
        super({ key: 'TugScene' });
        this.ropeGfx = null;
        this.bgGfx = null;
        this.blueMembers = [];
        this.redMembers = [];
        this.numMembers = 3;

        this.currentOffset = 0;
        this.targetOffset = 0;
        this.gameActive = false;
        this.bobTimer = 0;
        this.bluePullTimer = 0;
        this.redPullTimer = 0;
        this.lastBlueScore = 0;
        this.lastRedScore = 0;

        // Server node chain (21 points) — normalised to scene coords
        this.ropeNodes = [];
    }

    /* ================================================================
     *  LIFECYCLE
     * ================================================================ */

    create() {
        const { width, height } = this.scale;

        // 1. Epic Fantasy Background (Wall)
        // Set an exact split between wall and floor to fix perspective
        const floorSplit = height * 0.65; // Floor starts at 65% down
        
        this.wall = this.add.tileSprite(0, 0, width, floorSplit, 'wall_stone');
        this.wall.setOrigin(0, 0);
        // We'll scale the pixel art texture slightly so it's not tiny
        this.wall.tileScaleX = 2;
        this.wall.tileScaleY = 2;
        this.wall.setTint(0x888888); // Moody dungeon lighting
        
        // 2. Fantasy Floor (Alleyway / Stone)
        const floorHeight = height - floorSplit;
        this.floor = this.add.tileSprite(0, floorSplit, width, floorHeight, 'floor_stone_alley');
        this.floor.setOrigin(0, 0);
        this.floor.tileScaleX = 2.0;
        this.floor.tileScaleY = 0.5; // Squish vertically to create horizontal alley perspective
        this.floor.setTint(0x404040); // Darker, asphalt-like alley tone

        // 3. Decorative Center Banners hanging from the wall
        // Place one perfectly in the center, and two on the sides
        const bannerSpacing = width * 0.33;
        for (let x = width * 0.17; x < width; x += bannerSpacing) {
            const banner = this.add.image(x, 0, 'wall_banner');
            banner.setOrigin(0.5, 0);
            banner.setScale(3); // large pixel art banner
            banner.setTint(0xa0a0a0); // Match lighting
        }

        // Add an overarching dark vignette/fade to the edges to make it feel deeply cinematic
        const vignette = this.add.graphics();
        vignette.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.7, 0.7, 0, 0);
        vignette.fillRect(0, 0, width, height * 0.2); // Top shadow

        const vignetteBottom = this.add.graphics();
        vignetteBottom.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0, 0, 0.8, 0.8);
        vignetteBottom.fillRect(0, height * 0.8, width, height * 0.2); // Bottom shadow
        
        // Add a shadow directly on the seam between wall and floor to ground it
        const seamShadow = this.add.graphics();
        seamShadow.fillGradientStyle(0x000000, 0x000000, 0x000000, 0x000000, 0.6, 0.6, 0, 0);
        seamShadow.fillRect(0, floorSplit, width, height * 0.05);

        this.bgGfx = this.add.graphics();
        this.ropeGfx = this.add.graphics();

        // Create modular team members (Reverse order so front members draw on top)
        for (let i = this.numMembers - 1; i >= 0; i--) {
            const blueChar = this.createCharacter('blue');
            this.blueMembers.unshift(blueChar); // unshift so index 0 is front member
        }
        
        for (let i = this.numMembers - 1; i >= 0; i--) {
            const redChar = this.createCharacter('red');
            this.redMembers.unshift(redChar);
        }

        this.drawBackground(width, height);

        EventBus.on(GAME_EVENTS.ROPE_UPDATE, this.onServerUpdate, this);
        EventBus.on(GAME_EVENTS.GAME_START, this.onGameStart, this);
        EventBus.on(GAME_EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.emit(GAME_EVENTS.PHASER_READY);
    }

    /* ── Helpers ───────────────────────────────────────────────────── */

    getCharScale(h) { return Math.min(0.48, (h / 900) * 0.85); } // Make characters tangibly bigger
    getRopeY(h) { return h * 0.60; } // Move them slightly lower
    getRopeHalfLen(w) { return w * 0.15; }

    drawBackground(width, height) {
        this.bgGfx.clear();
        const cx = width / 2;
        
        // Ground Ellipse for Point 12 - anchored precisely to visually plant feet
        const groundWidth = width * 1.5; // very wide to pass beneath all UI 
        const groundHeight = height * 0.25;
        const groundY = height * 0.88; // low so it sweeps perfectly under feet

        // Paint a dark shadow blob underneath them instead of bright ellipse
        // Removed giant shadow blob to replace with individual character foot shadows
        
        // Draw an epic glowing marker line down the center wall/floor
        this.bgGfx.lineStyle(4, 0xD4B65A, 0.8); // Glowing golden rope color
        for (let y = height * 0.1; y < height - 5; y += 30) {
            this.bgGfx.lineBetween(cx, y, cx, Math.min(y + 15, height - 5));
        }
    }

    /* ================================================================
     *  CHARACTER CREATION
     * ================================================================ */
    createCharacter(team) {
        const cont = this.add.container(0, 0);
        const scale = 0.45;
        const isRed = team === 'red';
        const cPrefix = isRed ? 'red' : 'blue';
        const cPrefixCap = isRed ? 'Red' : 'Blue';
        
        const shadow = this.add.ellipse(-35, 125, 90, 20, 0x000000, 0.4);
        shadow.setName('shadow');

        // Origins adjusted so rotation happens at joints
        const backArm = this.add.image(-20, -10, cPrefix + 'Arm_long').setScale(scale).setTint(0xcccccc).setOrigin(0.5, 0.2);
        backArm.setName('backArm');
        backArm.setRotation(Math.PI / 6); 

        const backHand = this.add.image(0, 0, 'tint1_hand').setScale(scale * 0.8).setTint(0xcccccc);
        backHand.setName('backHand');

        const backLeg = this.add.image(-20, 40, 'pants' + cPrefixCap + '_long').setScale(scale).setTint(0xcccccc).setOrigin(0.5, 0.1);
        backLeg.setName('backLeg');
        const backShoe = this.add.image(-25, 110, cPrefix + 'Shoe1')
            .setScale(scale * 0.8)
            .setTint(0xcccccc);
        backShoe.setName('backShoe');
        
        const torso = this.add.image(-40, 0, cPrefix + 'Shirt1').setScale(scale);
        
        const head = this.add.image(-40, -80, 'tint1_head').setScale(scale);
        const face = this.add.image(-20, -80, 'face1').setScale(scale);
        
        const frontLeg = this.add.image(-40, 40, 'pants' + cPrefixCap + '_long').setScale(scale).setOrigin(0.5, 0.1);
        frontLeg.setName('frontLeg');
        const frontShoe = this.add.image(-45, 110, cPrefix + 'Shoe1')
            .setScale(scale * 0.8);
        frontShoe.setName('frontShoe');
        
        const frontArm = this.add.image(-25, -15, cPrefix + 'Arm_long').setScale(scale).setOrigin(0.5, 0.2);
        frontArm.setName('frontArm');
        frontArm.setRotation(Math.PI / 8); 
        
        const frontHand = this.add.image(0, 0, 'tint1_hand').setScale(scale * 0.8);
        frontHand.setName('frontHand');

        cont.add([shadow, backArm, backHand, backLeg, backShoe, torso, head, face, frontLeg, frontShoe, frontArm, frontHand]);
        
        // Initial setup
        if (isRed) cont.scaleX = -1;
        
        return cont;
    }

    /* ================================================================
     *  EVENT HANDLERS
     * ================================================================ */

    onServerUpdate(data) {
        if (data.progress !== undefined) {
            const { width } = this.scale;
            // Limit how far they can be dragged off screen so they stay 
            // under the glass but don't disappear entirely
            const maxShift = width * 0.15; 
            const newTarget = data.progress * maxShift;
            
            // Check if team pulled based on exact score increments, NOT fluctuating physics target
            if (data.players) {
                if (data.players.left && data.players.left.score > this.lastBlueScore) {
                    this.bluePullTimer = 1.2; // animate for 1.2s
                    this.lastBlueScore = data.players.left.score;
                }
                if (data.players.right && data.players.right.score > this.lastRedScore) {
                    this.redPullTimer = 1.2;
                    this.lastRedScore = data.players.right.score;
                }
            }
            this.targetOffset = newTarget;
        }
        // Capture the full server node chain
        if (data.ropeNodes && data.ropeNodes.length) {
            this.ropeNodes = data.ropeNodes;
        }
    }

    onGameStart() {
        this.gameActive = true;
        this.currentOffset = 0;
        this.targetOffset = 0;
        this.ropeNodes = [];
        this.lastBlueScore = 0;
        this.lastRedScore = 0;
        this.bluePullTimer = 0;
        this.redPullTimer = 0;
    }

    onGameOver(data) {
        this.gameActive = false;
        if (data && data.winner && data.winner !== 'draw') {
            const winners = data.winner === 'left' ? this.blueMembers : this.redMembers;
            if (winners) {
                winners.forEach(member => {
                    this.tweens.add({
                        targets: member,
                        scaleX: member.scaleX * 1.2,
                        scaleY: member.scaleY * 1.2,
                        duration: 250,
                        yoyo: true,
                        repeat: 3,
                        ease: 'Sine.easeInOut',
                    });
                });
            }
        }
    }

    /* ================================================================
     *  MAIN LOOP
     * ================================================================ */

    update(time, delta) {
        const dtSeconds = delta / 1000;
        this.bobTimer += delta * 0.003;

        // Smooth offset interpolation
        const lerpSpeed = 0.08;
        this.currentOffset += (this.targetOffset - this.currentOffset) * lerpSpeed;

        const { width, height } = this.scale;
        const cx = width / 2;
        const ropeY = this.getRopeY(height);
        const charScale = this.getCharScale(height);

        // Character anchor spread
        const charHalf = Math.max(120, width * 0.16);
        const charLeftX = cx - charHalf + this.currentOffset;
        const charRightX = cx + charHalf + this.currentOffset;

        const baseCharScale = charScale * 1.2;
        const spacing = 80 * baseCharScale;

        const charY = ropeY;
        const attachY = charY; // Nodes map to exact hand positions 

        if (this.bluePullTimer > 0) this.bluePullTimer -= dtSeconds;
        if (this.redPullTimer > 0) this.redPullTimer -= dtSeconds;

        // Shared function for animating limbs in the update loop
        const animateLimbs = (member, offset, isRed, intensity) => {
            const time = this.bobTimer * 8 + offset;
            // Dampen animation amplitude if intensity is 0
            const pullAmt = Math.max(0, Math.min(1, intensity * 2)); 
            
            const frontArm = member.getByName('frontArm');
            const backArm = member.getByName('backArm');
            const frontLeg = member.getByName('frontLeg');
            const backLeg = member.getByName('backLeg');
            const frontHand = member.getByName('frontHand');
            const backHand = member.getByName('backHand');

            const frontShoe = member.getByName('frontShoe');
            const backShoe = member.getByName('backShoe');
            const shadow = member.getByName('shadow');

            // Strainy pulling arm motion only active when pullAmt > 0
            if (frontArm) frontArm.rotation = (Math.PI / 8) + (Math.sin(time) * 0.2 * pullAmt);
            if (backArm) backArm.rotation = (Math.PI / 6) + (Math.cos(time) * 0.2 * pullAmt);

            // Legs planting and pushing only when pulling
            if (frontLeg) frontLeg.rotation = (Math.sin(time + 1) * 0.15) * pullAmt;
            if (backLeg) backLeg.rotation = -0.1 + (Math.cos(time + 1) * 0.15) * pullAmt;

            // Counteract container rotation so feet and shadow stay flat on the ground
            if (frontShoe) frontShoe.rotation = -member.rotation;
            if (backShoe) backShoe.rotation = -member.rotation;
            if (shadow) shadow.rotation = -member.rotation;

            // Hands shifting slightly with arm rotation
            if (frontHand) {
                frontHand.y = 10 + (Math.sin(time) * 5) * pullAmt;
                frontHand.x = (Math.cos(time) * 5) * pullAmt;
            }
            if (backHand) {
                backHand.y = (Math.cos(time) * 5) * pullAmt;
                backHand.x = (Math.sin(time) * 5) * pullAmt;
            }
        };

        // Update blue members (staggered bobs and leans)
        this.blueMembers.forEach((member, i) => {
            const intensity = this.bluePullTimer > 0 ? 1 : 0;
            const mBob = (Math.sin(this.bobTimer * 5 + i) * 2) * intensity;
            // When not actively pulling, lean slightly back in a rigid pose. When pulling, yank back and forth.
            const leanDir = -0.25 + (Math.sin(this.bobTimer * 4) * 0.05 * intensity); 
            
            member.setScale(baseCharScale);
            member.scaleX = baseCharScale; // Face right toward the rope
            
            member.x = charLeftX - (i * spacing);
            member.y = charY + mBob;
            member.rotation = leanDir;
            
            animateLimbs(member, i, false, intensity);
        });

        // Update red members
        this.redMembers.forEach((member, i) => {
            const intensity = this.redPullTimer > 0 ? 1 : 0;
            const mBob = (Math.sin(this.bobTimer * 5 + i + 1.5) * 2) * intensity;
            const leanDir = 0.25 - (Math.sin(this.bobTimer * 4 + 1.5) * 0.05 * intensity); 
            
            member.setScale(baseCharScale);
            member.scaleX = -baseCharScale; // Face left toward the rope
            
            member.x = charRightX + (i * spacing);
            member.y = charY + mBob;
            member.rotation = leanDir;
            
            animateLimbs(member, i + 1.5, true, intensity);
        });

        // Build the scene-space rope points spanning through the characters to the ground
        const sceneNodes = this.buildSceneNodes(charLeftX, charRightX, attachY);

        // Draw simple clean rope
        this.drawRope3D(sceneNodes, attachY, cx + this.currentOffset);
    }

    /* ================================================================
     *  SCENE-SPACE NODE MAPPING
     * ================================================================ */

    /**
     * Map the 21 server nodes for the center, and append tails that 
     * span through the team members and connect to the ground.
     */
    buildSceneNodes(leftX, rightX, ropeY) {
        const count = 21;
        const physicsNodes = [];
        const baseCharScale = this.getCharScale(this.scale.height) * 1.2;
        const spacing = 80 * baseCharScale;

        // Add tail nodes passing through the Blue Team hands
        for (let i = this.numMembers - 1; i > 0; i--) {
            physicsNodes.push({ x: leftX - (i * spacing), y: ropeY });
        }

        // 1. Center physics section (taut in the middle)
        if (this.ropeNodes.length === count) {
            const srvLeft = this.ropeNodes[0];
            const srvRight = this.ropeNodes[count - 1];
            const srvW = srvRight.x - srvLeft.x || 1;
            const sceneW = rightX - leftX;

            for (let i = 0; i < count; i++) {
                const t = (this.ropeNodes[i].x - srvLeft.x) / srvW;
                const sx = leftX + t * sceneW;
                // Map server Y deviation into scene-space
                const srvYDev = this.ropeNodes[i].y - 300; 
                const sy = ropeY + srvYDev * (sceneW / 800) * 0.45;
                physicsNodes.push({ x: sx, y: sy });
            }
        } else {
            // Synthetic tight fallback
            for (let i = 0; i < count; i++) {
                const t = i / (count - 1);
                const sx = leftX + t * (rightX - leftX);
                const sag = Math.sin(t * Math.PI) * 12;
                physicsNodes.push({ x: sx, y: ropeY + sag });
            }
        }

        // Add tail nodes passing through the Red Team hands
        for (let i = 1; i < this.numMembers; i++) {
            physicsNodes.push({ x: rightX + (i * spacing), y: ropeY });
        }

        return physicsNodes;
    }

    /* ================================================================
     *  CLEAN SIMPLE ROPE RENDERER
     * ================================================================ */

    drawRope3D(nodes, ropeY, centerWorldX) {
        this.ropeGfx.clear();
        if (nodes.length < 2) return;

        const h = this.scale.height;
        const sF = Math.max(0.3, h / 900); // Scale factor based on 900px height baseline
        
        // Simple clean rope aesthetics
        const OUTLINE_WIDTH = 12 * sF;
        const CORE_WIDTH = 8 * sF;

        // 1. Catmull-Rom spline → smooth curve
        const spline = this.catmullRomSpline(nodes, SPLINE_SAMPLES);
        if (spline.length < 4) return;
        
        // Compute lengths for texturing
        let totalLen = 0;
        const lengths = [0];
        for (let i = 1; i < spline.length; i++) {
            const dx = spline[i].x - spline[i - 1].x;
            const dy = spline[i].y - spline[i - 1].y;
            totalLen += Math.sqrt(dx * dx + dy * dy);
            lengths.push(totalLen);
        }

        // ── Layer 1: Dark Outline / Shadow ──────────────────────────
        this.ropeGfx.lineStyle(OUTLINE_WIDTH, 0x5C4415, 1); 
        this.ropeGfx.beginPath();
        this.ropeGfx.moveTo(spline[0].x, spline[0].y);
        for (let i = 1; i < spline.length; i++) {
            this.ropeGfx.lineTo(spline[i].x, spline[i].y);
        }
        this.ropeGfx.strokePath();

        // ── Layer 2: Inner Base Body ───────────────────────────────
        this.ropeGfx.lineStyle(CORE_WIDTH, 0x9E7B2F, 1); 
        this.ropeGfx.beginPath();
        this.ropeGfx.moveTo(spline[0].x, spline[0].y);
        for (let i = 1; i < spline.length; i++) {
            this.ropeGfx.lineTo(spline[i].x, spline[i].y);
        }
        this.ropeGfx.strokePath();
        
        // ── Layer 3: Rope Segment Dashes ──────────────────────────────
        const segmentPeriod = 15 * sF;
        this.ropeGfx.lineStyle(CORE_WIDTH, 0xD4B65A, 0.9);
        this.ropeGfx.beginPath();
        
        let drawing = false;
        let pIndex = 0;
        
        for (let t = 0; t <= totalLen; t += 2) {
            // Find current spline segment
            while (pIndex < lengths.length - 1 && lengths[pIndex + 1] < t) {
                pIndex++;
            }
            
            const l0 = lengths[pIndex];
            const l1 = lengths[pIndex + 1] || (l0 + 1);
            const ratio = (t - l0) / (l1 - l0);
            
            const pt0 = spline[pIndex];
            const pt1 = spline[pIndex + 1] || pt0;
            
            const x = pt0.x + (pt1.x - pt0.x) * ratio;
            const y = pt0.y + (pt1.y - pt0.y) * ratio;
            
            const stage = (t % segmentPeriod) / segmentPeriod;
            if (stage < 0.5) {
                if (!drawing) {
                    this.ropeGfx.moveTo(x, y);
                    drawing = true;
                } else {
                    this.ropeGfx.lineTo(x, y);
                }
            } else {
                drawing = false;
            }
        }
        this.ropeGfx.strokePath();

        // ── Center Flag Tracking ────────────────────────────────────
        let flagPt = spline[Math.floor(spline.length / 2)];
        if (centerWorldX !== undefined) {
            let minDist = Infinity;
            for (let i = 0; i < spline.length; i++) {
                const dist = Math.abs(spline[i].x - centerWorldX);
                if (dist < minDist) {
                    minDist = dist;
                    flagPt = spline[i];
                }
            }
        }

        if (flagPt) {
            this.drawFlag(flagPt.x, flagPt.y, sF);
        }
    }

    /* ── Flag rendering ──────────────────────────────────────────── */
    drawFlag(cx, cy, sF) {
        // Pole
        this.ropeGfx.lineStyle(3 * sF, 0x555555, 1);
        const poleH = 45 * sF;
        this.ropeGfx.lineBetween(cx, cy, cx, cy - poleH);
        // Flag body
        this.ropeGfx.fillStyle(FLAG_RED, 1);
        this.ropeGfx.fillTriangle(
            cx, cy - poleH,
            cx + (22 * sF), cy - (34 * sF),
            cx, cy - (23 * sF),
        );
        // Highlight
        this.ropeGfx.fillStyle(0xFF5252, 0.5);
        this.ropeGfx.fillTriangle(
            cx + (2 * sF), cy - (43 * sF),
            cx + (18 * sF), cy - (35 * sF),
            cx + (2 * sF), cy - (27 * sF),
        );
    }

    /* ================================================================
     *  CATMULL-ROM SPLINE
     * ================================================================ */

    /**
     * Generate a smooth spline through the given control points.
     * Uses centripetal Catmull-Rom (alpha = 0.5) to avoid cusps.
     */
    catmullRomSpline(pts, totalSamples) {
        if (pts.length < 2) return pts.slice();
        const result = [];
        const n = pts.length;
        // Pad with virtual control points at each end
        const p = [
            { x: 2 * pts[0].x - pts[1].x, y: 2 * pts[0].y - pts[1].y },
            ...pts,
            { x: 2 * pts[n - 1].x - pts[n - 2].x, y: 2 * pts[n - 1].y - pts[n - 2].y },
        ];

        const segCount = n - 1;
        const samplesPerSeg = Math.max(2, Math.ceil(totalSamples / segCount));

        for (let seg = 0; seg < segCount; seg++) {
            const p0 = p[seg];
            const p1 = p[seg + 1];
            const p2 = p[seg + 2];
            const p3 = p[seg + 3];

            const steps = seg === segCount - 1 ? samplesPerSeg : samplesPerSeg;
            for (let s = 0; s < steps; s++) {
                const t = s / (steps - 1);
                // Cubic Catmull-Rom formula
                const tt = t * t;
                const ttt = tt * t;

                const x =
                    0.5 * (
                        (2 * p1.x) +
                        (-p0.x + p2.x) * t +
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt +
                        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * ttt
                    );
                const y =
                    0.5 * (
                        (2 * p1.y) +
                        (-p0.y + p2.y) * t +
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt +
                        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * ttt
                    );

                result.push({ x, y });
            }
        }
        return result;
    }

    /* ================================================================
     *  CLEANUP
     * ================================================================ */

    shutdown() {
        EventBus.off(GAME_EVENTS.ROPE_UPDATE, this.onServerUpdate, this);
        EventBus.off(GAME_EVENTS.GAME_START, this.onGameStart, this);
        EventBus.off(GAME_EVENTS.GAME_OVER, this.onGameOver, this);
    }

    destroy() {
        this.shutdown();
        super.destroy();
    }
}
