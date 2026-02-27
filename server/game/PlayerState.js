/**
 * Per-player state model.
 * Stores player identity, score, side assignment, and current problem.
 */

export class PlayerState {
    /**
     * @param {string} id - Unique player identifier
     * @param {WebSocket} ws - WebSocket connection reference
     * @param {'left'|'right'} side - Which side of the screen
     */
    constructor(id, ws, side) {
        this.id = id;
        this.ws = ws;
        this.side = side;
        this.score = 0;
        this.currentProblem = null;
        this.currentChoices = null;
        this.isReady = false;
        this.streak = 0;
    }

    /**
     * Safely send a JSON message to this player's WebSocket.
     */
    send(messageObj) {
        if (this.ws.readyState === this.ws.OPEN) {
            this.ws.send(JSON.stringify(messageObj));
        }
    }

    /**
     * Assign a new problem to this player.
     */
    assignProblem(problem, choices) {
        this.currentProblem = problem;
        this.currentChoices = choices;
    }

    /**
     * Record a correct answer.
     */
    recordCorrect() {
        this.score++;
        this.streak++;
    }

    /**
     * Record an incorrect answer.
     */
    recordIncorrect() {
        this.streak = 0;
    }

    /**
     * Serialize player state for broadcast (excludes WebSocket reference).
     */
    toJSON() {
        return {
            id: this.id,
            side: this.side,
            score: this.score,
            streak: this.streak,
            isReady: this.isReady,
        };
    }
}
