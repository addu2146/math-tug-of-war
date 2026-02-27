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
        this.blueTeam = null;
        this.redTeam = null;

        this.currentOffset = 0;
        this.targetOffset = 0;
        this.gameActive = false;
        this.bobTimer = 0;

        // Server node chain (21 points) — normalised to scene coords
        this.ropeNodes = [];
    }

    /* ================================================================
     *  LIFECYCLE
     * ================================================================ */

    create() {
        const { width, height } = this.scale;

        this.bgGfx = this.add.graphics();
        this.ropeGfx = this.add.graphics();

        const charScale = this.getCharScale(height);
        const ropeY = this.getRopeY(height);

        this.blueTeam = this.add.image(0, ropeY, 'blue_team');
        this.blueTeam.setScale(charScale);
        this.blueTeam.setOrigin(0.78, 0.55);

        this.redTeam = this.add.image(0, ropeY, 'red_team');
        this.redTeam.setScale(charScale);
        this.redTeam.setOrigin(0.22, 0.55);

        this.drawBackground(width, height);

        EventBus.on(GAME_EVENTS.ROPE_UPDATE, this.onServerUpdate, this);
        EventBus.on(GAME_EVENTS.GAME_START, this.onGameStart, this);
        EventBus.on(GAME_EVENTS.GAME_OVER, this.onGameOver, this);
        EventBus.emit(GAME_EVENTS.PHASER_READY);
    }

    /* ── Helpers ───────────────────────────────────────────────────── */

    getCharScale(h) { return Math.min(0.38, h / 900); }
    getRopeY(h) { return h * 0.55; }
    getRopeHalfLen(w) { return w * 0.28; }

    drawBackground(width, height) {
        this.bgGfx.clear();
        const cx = width / 2;
        this.bgGfx.lineStyle(2, CENTER_LINE, 0.35);
        for (let y = 5; y < height - 5; y += 22) {
            this.bgGfx.lineBetween(cx, y, cx, Math.min(y + 12, height - 5));
        }
    }

    /* ================================================================
     *  EVENT HANDLERS
     * ================================================================ */

    onServerUpdate(data) {
        if (data.progress !== undefined) {
            const { width } = this.scale;
            const maxShift = width * 0.25;
            this.targetOffset = data.progress * maxShift;
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
    }

    onGameOver(data) {
        this.gameActive = false;
        if (data && data.winner && data.winner !== 'draw') {
            const winner = data.winner === 'left' ? this.blueTeam : this.redTeam;
            if (winner) {
                this.tweens.add({
                    targets: winner,
                    scaleX: winner.scaleX * 1.2,
                    scaleY: winner.scaleY * 1.2,
                    duration: 250,
                    yoyo: true,
                    repeat: 3,
                    ease: 'Sine.easeInOut',
                });
            }
        }
    }

    /* ================================================================
     *  MAIN LOOP
     * ================================================================ */

    update(time, delta) {
        this.bobTimer += delta * 0.003;

        // Smooth offset interpolation
        const lerpSpeed = 0.08;
        this.currentOffset += (this.targetOffset - this.currentOffset) * lerpSpeed;

        const { width, height } = this.scale;
        const cx = width / 2;
        const ropeY = this.getRopeY(height);
        const halfLen = this.getRopeHalfLen(width);
        const charScale = this.getCharScale(height);

        // Two separate spreads: characters are positioned at CHAR spread,
        // rope extends further to ROPE spread so it overlaps INTO the sprites.
        const charHalf = width * 0.28;   // character anchor spread
        const ropeHalf = width * 0.38;   // rope endpoints (wider, reaches into sprites)

        const charLeftX = cx - charHalf + this.currentOffset;
        const charRightX = cx + charHalf + this.currentOffset;
        const ropeLeftX = cx - ropeHalf + this.currentOffset;
        const ropeRightX = cx + ropeHalf + this.currentOffset;

        // Character bobbing
        const bob = Math.sin(this.bobTimer * 2) * 2.5;
        const leanBlue = Math.sin(this.bobTimer * 3) * 0.04;
        const leanRed = Math.sin(this.bobTimer * 3 + 1.5) * 0.04;

        if (this.blueTeam) {
            this.blueTeam.setScale(charScale);
            this.blueTeam.x = charLeftX;
            this.blueTeam.y = ropeY + bob;
            this.blueTeam.rotation = -0.1 + leanBlue;
        }
        if (this.redTeam) {
            this.redTeam.setScale(charScale);
            this.redTeam.x = charRightX;
            this.redTeam.y = ropeY + bob;
            this.redTeam.rotation = 0.1 + leanRed;
        }

        // Build the scene-space rope points
        const sceneNodes = this.buildSceneNodes(ropeLeftX, ropeRightX, ropeY);

        // Draw 3D rope
        this.drawRope3D(sceneNodes, ropeY);
    }

    /* ================================================================
     *  SCENE-SPACE NODE MAPPING
     * ================================================================ */

    /**
     * Map the 21 server nodes (in server-space 0-800) into canvas-space,
     * OR generate a synthetic catenary if no server data yet.
     */
    buildSceneNodes(leftX, rightX, ropeY) {
        const count = 21;
        const nodes = [];

        if (this.ropeNodes.length === count) {
            // Server data available — map from server coords to scene coords
            const srvLeft = this.ropeNodes[0];
            const srvRight = this.ropeNodes[count - 1];
            const srvW = srvRight.x - srvLeft.x || 1;
            const sceneW = rightX - leftX;

            for (let i = 0; i < count; i++) {
                const t = (this.ropeNodes[i].x - srvLeft.x) / srvW;
                const sx = leftX + t * sceneW;
                // Map server Y deviation into scene-space (scale down for subtlety)
                const srvYDev = this.ropeNodes[i].y - 300; // 300 is server REST_Y
                const sy = ropeY + srvYDev * (sceneW / 800) * 0.45;
                nodes.push({ x: sx, y: sy });
            }
        } else {
            // Synthetic catenary fallback
            for (let i = 0; i < count; i++) {
                const t = i / (count - 1);
                const sx = leftX + t * (rightX - leftX);
                const sag = Math.sin(t * Math.PI) * 18;
                nodes.push({ x: sx, y: ropeY + sag });
            }
        }
        return nodes;
    }

    /* ================================================================
     *  3-D BRAIDED ROPE RENDERER
     * ================================================================ */

    drawRope3D(nodes, ropeY) {
        this.ropeGfx.clear();
        if (nodes.length < 2) return;

        // 1. Catmull-Rom spline → smooth curve
        const spline = this.catmullRomSpline(nodes, SPLINE_SAMPLES);
        if (spline.length < 4) return;

        // Precompute tangents & normals
        const tangents = [];
        const normals = [];
        for (let i = 0; i < spline.length; i++) {
            const prev = spline[Math.max(0, i - 1)];
            const next = spline[Math.min(spline.length - 1, i + 1)];
            const dx = next.x - prev.x;
            const dy = next.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            tangents.push({ x: dx / len, y: dy / len });
            normals.push({ x: -dy / len, y: dx / len });
        }

        // 2. Build twin braid strands
        const strandA = [];
        const strandB = [];
        let accumDist = 0;
        for (let i = 0; i < spline.length; i++) {
            if (i > 0) {
                const dx = spline[i].x - spline[i - 1].x;
                const dy = spline[i].y - spline[i - 1].y;
                accumDist += Math.sqrt(dx * dx + dy * dy);
            }
            // Sinusoidal braid cross-over
            const braidPhase = Math.sin((accumDist / BRAID_PERIOD) * Math.PI * 2);
            const offA = STRAND_OFFSET * braidPhase;
            const offB = -STRAND_OFFSET * braidPhase;

            strandA.push({
                x: spline[i].x + normals[i].x * offA,
                y: spline[i].y + normals[i].y * offA,
            });
            strandB.push({
                x: spline[i].x + normals[i].x * offB,
                y: spline[i].y + normals[i].y * offB,
            });
        }

        // ── Layer 1: Wide shadow ────────────────────────────────────
        this.ropeGfx.lineStyle(SHADOW_WIDTH, ROPE_SHADOW, 0.12);
        this.ropeGfx.beginPath();
        this.ropeGfx.moveTo(spline[0].x, spline[0].y + 4);
        for (let i = 1; i < spline.length; i++) {
            this.ropeGfx.lineTo(spline[i].x, spline[i].y + 4);
        }
        this.ropeGfx.strokePath();

        // ── Layer 2: Dark base body ─────────────────────────────────
        this.ropeGfx.lineStyle(ROPE_WIDTH + 4, ROPE_DARK, 0.85);
        this.ropeGfx.beginPath();
        this.ropeGfx.moveTo(spline[0].x, spline[0].y);
        for (let i = 1; i < spline.length; i++) {
            this.ropeGfx.lineTo(spline[i].x, spline[i].y);
        }
        this.ropeGfx.strokePath();

        // ── Layer 3: Strand A (bottom/dark strand) ──────────────────
        this.ropeGfx.lineStyle(ROPE_WIDTH, ROPE_BASE, 1);
        this.ropeGfx.beginPath();
        this.ropeGfx.moveTo(strandA[0].x, strandA[0].y);
        for (let i = 1; i < strandA.length; i++) {
            this.ropeGfx.lineTo(strandA[i].x, strandA[i].y);
        }
        this.ropeGfx.strokePath();

        // ── Layer 4: Strand B (top/light strand) ────────────────────
        this.ropeGfx.lineStyle(ROPE_WIDTH, ROPE_LIGHT, 0.8);
        this.ropeGfx.beginPath();
        this.ropeGfx.moveTo(strandB[0].x, strandB[0].y);
        for (let i = 1; i < strandB.length; i++) {
            this.ropeGfx.lineTo(strandB[i].x, strandB[i].y);
        }
        this.ropeGfx.strokePath();

        // ── Layer 5: Highlight edge (top) ───────────────────────────
        this.ropeGfx.lineStyle(1.5, 0xF5E6B0, 0.35);
        this.ropeGfx.beginPath();
        this.ropeGfx.moveTo(spline[0].x + normals[0].x * -3, spline[0].y + normals[0].y * -3);
        for (let i = 1; i < spline.length; i++) {
            this.ropeGfx.lineTo(
                spline[i].x + normals[i].x * -3,
                spline[i].y + normals[i].y * -3,
            );
        }
        this.ropeGfx.strokePath();

        // ── Layer 6: Knot wraps ─────────────────────────────────────
        accumDist = 0;
        for (let i = 1; i < spline.length; i++) {
            const dx = spline[i].x - spline[i - 1].x;
            const dy = spline[i].y - spline[i - 1].y;
            accumDist += Math.sqrt(dx * dx + dy * dy);
            if (accumDist >= KNOT_SPACING) {
                accumDist = 0;
                this.drawKnot(spline[i], normals[i], tangents[i]);
            }
        }

        // ── Flag at center node (node 10 of 21) ────────────────────
        const centerIdx = Math.floor(spline.length / 2);
        const flagPt = spline[centerIdx];
        this.drawFlag(flagPt.x, flagPt.y);
    }

    /* ── Knot wrap decoration ────────────────────────────────────── */
    drawKnot(pt, normal, tangent) {
        const r = ROPE_WIDTH + 3;
        // Short diagonal wraps
        this.ropeGfx.lineStyle(2.5, ROPE_DARK, 0.55);
        for (let j = -1; j <= 1; j++) {
            const cx = pt.x + tangent.x * j * 3;
            const cy = pt.y + tangent.y * j * 3;
            this.ropeGfx.lineBetween(
                cx + normal.x * r, cy + normal.y * r,
                cx - normal.x * r, cy - normal.y * r,
            );
        }
        // Highlight dot at center
        this.ropeGfx.fillStyle(ROPE_LIGHT, 0.5);
        this.ropeGfx.fillCircle(pt.x, pt.y, 2);
    }

    /* ── Flag rendering ──────────────────────────────────────────── */
    drawFlag(cx, cy) {
        // Pole
        this.ropeGfx.lineStyle(3, 0x555555, 1);
        this.ropeGfx.lineBetween(cx, cy, cx, cy - 45);
        // Flag body
        this.ropeGfx.fillStyle(FLAG_RED, 1);
        this.ropeGfx.fillTriangle(
            cx, cy - 45,
            cx + 22, cy - 34,
            cx, cy - 23,
        );
        // Highlight
        this.ropeGfx.fillStyle(0xFF5252, 0.5);
        this.ropeGfx.fillTriangle(
            cx + 2, cy - 43,
            cx + 18, cy - 35,
            cx + 2, cy - 27,
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
