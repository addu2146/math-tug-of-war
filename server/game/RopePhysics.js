/**
 * RopePhysics — Verlet integration rope chain with real physics.
 *
 * Each node is a point-mass connected by distance constraints.
 * Gravity creates natural catenary sag. Endpoint forces pull the
 * whole chain when a team scores. Iterative constraint relaxation
 * keeps the rope taut but flexible.
 *
 * API surface is unchanged — GameRoom.js needs zero modifications.
 */

const TOTAL_NODES = 21;
const ROPE_LENGTH = 800;
const SEGMENT_LENGTH = ROPE_LENGTH / (TOTAL_NODES - 1);
const PULL_AMOUNT = 12;          // px per correct answer
const GRAVITY = 0.4;             // downward pull per tick
const DAMPING = 0.985;           // velocity retention (verlet style)
const CONSTRAINT_ITERATIONS = 8; // relaxation passes per tick
const VICTORY_THRESHOLD = 180;
const REST_Y = 300;              // neutral rope height

export class RopePhysics {
    constructor() {
        this.reset();
    }

    reset() {
        this.centerOffset = 0;
        this.targetOffset = 0;
        this.velocity = 0;

        this.nodes = [];
        const startX = 0;
        for (let i = 0; i < TOTAL_NODES; i++) {
            const x = startX + i * SEGMENT_LENGTH;
            this.nodes.push({
                x,
                y: REST_Y,
                prevX: x,
                prevY: REST_Y,
            });
        }
    }

    /**
     * Apply force — shifts the rope toward the scoring side.
     * Left team pulls left (negative), Right team pulls right (positive).
     */
    applyForce(side) {
        if (side === 'left') {
            this.targetOffset -= PULL_AMOUNT;
        } else {
            this.targetOffset += PULL_AMOUNT;
        }
    }

    /**
     * Physics tick — verlet integration + constraint solving.
     */
    tick() {
        // 1. Spring-based offset (keeps existing win-condition math)
        const springForce = (this.targetOffset - this.centerOffset) * 0.15;
        this.velocity += springForce;
        this.velocity *= 0.92;
        this.centerOffset += this.velocity;

        // 2. Set endpoint targets based on centerOffset
        const leftTarget = this.centerOffset;
        const rightTarget = ROPE_LENGTH + this.centerOffset;

        // 3. Verlet integration for interior nodes
        for (let i = 1; i < TOTAL_NODES - 1; i++) {
            const node = this.nodes[i];
            const vx = (node.x - node.prevX) * DAMPING;
            const vy = (node.y - node.prevY) * DAMPING;

            node.prevX = node.x;
            node.prevY = node.y;

            node.x += vx;
            node.y += vy + GRAVITY; // gravity pulls down
        }

        // 4. Pin endpoints to their target positions
        this.nodes[0].x = leftTarget;
        this.nodes[0].y = REST_Y;
        this.nodes[0].prevX = leftTarget;
        this.nodes[0].prevY = REST_Y;

        this.nodes[TOTAL_NODES - 1].x = rightTarget;
        this.nodes[TOTAL_NODES - 1].y = REST_Y;
        this.nodes[TOTAL_NODES - 1].prevX = rightTarget;
        this.nodes[TOTAL_NODES - 1].prevY = REST_Y;

        // 5. Constraint relaxation — enforce segment lengths
        for (let iter = 0; iter < CONSTRAINT_ITERATIONS; iter++) {
            for (let i = 0; i < TOTAL_NODES - 1; i++) {
                const a = this.nodes[i];
                const b = this.nodes[i + 1];

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) continue;

                const diff = (SEGMENT_LENGTH - dist) / dist;
                const offsetX = dx * 0.5 * diff;
                const offsetY = dy * 0.5 * diff;

                // Don't move pinned endpoints
                if (i === 0) {
                    b.x += offsetX * 2;
                    b.y += offsetY * 2;
                } else if (i + 1 === TOTAL_NODES - 1) {
                    a.x -= offsetX * 2;
                    a.y -= offsetY * 2;
                } else {
                    a.x -= offsetX;
                    a.y -= offsetY;
                    b.x += offsetX;
                    b.y += offsetY;
                }
            }
        }

        // 6. Clamp Y so rope doesn't fly off screen
        for (let i = 1; i < TOTAL_NODES - 1; i++) {
            if (this.nodes[i].y > REST_Y + 80) {
                this.nodes[i].y = REST_Y + 80;
                this.nodes[i].prevY = REST_Y + 80;
            }
            if (this.nodes[i].y < REST_Y - 30) {
                this.nodes[i].y = REST_Y - 30;
                this.nodes[i].prevY = REST_Y - 30;
            }
        }
    }

    /**
     * Get current node positions.
     * Returns [{x, y}, ...] for all 21 nodes.
     */
    getNodePositions() {
        return this.nodes.map(n => ({ x: n.x, y: n.y }));
    }

    /**
     * Get progress as -1 to +1 normalized value.
     */
    getProgress() {
        return Math.max(-1, Math.min(1, this.centerOffset / VICTORY_THRESHOLD));
    }

    /**
     * Check if either side has won.
     */
    checkVictory() {
        if (this.centerOffset <= -VICTORY_THRESHOLD) return 'left';
        if (this.centerOffset >= VICTORY_THRESHOLD) return 'right';
        return null;
    }
}
