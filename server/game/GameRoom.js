/**
 * GameRoom — Same-screen multiplayer game room.
 * 
 * Both players are managed from a single WebSocket connection.
 * The client sends `side: 'left'|'right'` with each answer.
 * Server validates answers, updates rope physics, and broadcasts state at 20Hz.
 */

import { RopePhysics } from './RopePhysics.js';
import { generateProblem, generateChoices } from '../math/ProblemGenerator.js';

const TICK_RATE = 20;
const TICK_INTERVAL = 1000 / TICK_RATE;
const GAME_DURATION = 120; // seconds

export class GameRoom {
    constructor(id, config = {}) {
        this.id = id;
        this.isNetwork = config.isNetwork || false;
        
        this.tickInterval = null;
        this.timerInterval = null;
        this.gameActive = false;
        
        // Sanitize configuration inputs
        this.difficulty = Number(config.difficulty) || 1;
        if (this.difficulty < 1 || this.difficulty > 3) this.difficulty = 1;
        
        this.operations = Array.isArray(config.operations) && config.operations.length > 0 
            ? config.operations.filter(op => typeof op === 'string').slice(0, 10) 
            : ['add'];
            
        // Prevent extremely long room/team names (DoS / UI Breakage)
        this.teamNames = {
            left: (config.teamNames?.left || 'Team 1').toString().substring(0, 30),
            right: (config.teamNames?.right || 'Team 2').toString().substring(0, 30)
        };
        
        // Prevent infinite or extremely long games
        this.gameDuration = Number(config.duration) || GAME_DURATION;
        if (this.gameDuration < 10 || this.gameDuration > 600) this.gameDuration = GAME_DURATION;
        
        this.timeRemaining = this.gameDuration;

        this.players = {
            left: { ws: null, score: 0, streak: 0, problem: null, choices: [], inputValue: '' },
            right: { ws: null, score: 0, streak: 0, problem: null, choices: [], inputValue: '' },
        };
        
        this.rope = new RopePhysics();
    }

    addPlayer(ws, role) {
        if (role === 'local') {
            this.players.left.ws = ws;
            this.players.right.ws = ws;
        } else if (role === 'left' || role === 'right') {
            this.players[role].ws = ws;
        }
    }

    removePlayerByWs(ws) {
        if (this.players.left.ws === ws) this.players.left.ws = null;
        if (this.players.right.ws === ws) this.players.right.ws = null;
    }

    get isFull() {
        if (this.isNetwork) {
            return this.players.left.ws !== null && this.players.right.ws !== null;
        }
        return this.players.left.ws !== null;
    }

    send(data) {
        const payload = JSON.stringify(data);
        const sentTo = new Set();
        
        const trySend = (ws) => {
            if (ws && ws.readyState === 1 && !sentTo.has(ws)) {
                ws.send(payload);
                sentTo.add(ws);
            }
        };

        trySend(this.players.left.ws);
        trySend(this.players.right.ws);
    }

    startGame() {
        this.gameActive = true;
        this.timeRemaining = this.gameDuration;
        this.rope.reset();

        // Assign problems to both players
        this.assignNewProblem('left');
        this.assignNewProblem('right');

        // Send initial state
        this.send({
            type: 'GAME_START',
            payload: {
                teamNames: this.teamNames,
                timeRemaining: this.timeRemaining,
                ropeNodes: this.rope.getNodePositions(),
                players: this.getPlayersState(),
                problems: {
                    left: this.getProblemPayload('left'),
                    right: this.getProblemPayload('right'),
                },
            },
        });

        // Start 20Hz tick loop
        this.tickInterval = setInterval(() => this.tick(), TICK_INTERVAL);

        // Start timer (1 second intervals)
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            if (this.timeRemaining <= 0) {
                this.endGameByTimer();
            }
        }, 1000);
    }

    assignNewProblem(side) {
        const op = this.operations[Math.floor(Math.random() * this.operations.length)];
        const problem = generateProblem({ level: this.difficulty, operation: op });
        this.players[side].problem = problem;
        // Not using choices for numpad — player types their answer
    }

    getProblemPayload(side) {
        const p = this.players[side].problem;
        if (!p) return null;
        return {
            id: p.id,
            expression: p.displayExpression,
        };
    }

    handleRageQuit(side) {
        if (!this.gameActive) return;
        
        // The *other* team wins immediately
        const winner = side === 'left' ? 'right' : 'left';
        
        this.endGame(winner, 'surrender');
    }

    handleAnswer(side, answer) {
        if (!this.gameActive) return;
        const player = this.players[side];
        if (!player || !player.problem) return;

        const numAnswer = Number(answer);
        const isCorrect = numAnswer === player.problem.answer;

        if (isCorrect) {
            player.score++;
            player.streak++;
            // Pull rope toward the scoring side
            this.rope.applyForce(side);
        } else {
            player.streak = 0;
        }

        // Send answer result
        this.send({
            type: 'ANSWER_RESULT',
            payload: {
                side,
                correct: isCorrect,
                correctAnswer: player.problem.answer,
                score: player.score,
                streak: player.streak,
            },
        });

        // Assign new problem
        this.assignNewProblem(side);
        this.send({
            type: 'NEW_PROBLEM',
            payload: {
                side,
                problem: this.getProblemPayload(side),
            },
        });
    }

    tick() {
        if (!this.gameActive) return;

        this.rope.tick();

        // Check victory
        const victor = this.rope.checkVictory();
        if (victor) {
            this.endGame(victor, 'rope');
            return;
        }

        // Broadcast state
        this.send({
            type: 'STATE_UPDATE',
            payload: {
                ropeNodes: this.rope.getNodePositions(),
                progress: this.rope.getProgress(),
                players: this.getPlayersState(),
                timeRemaining: this.timeRemaining,
            },
        });
    }

    endGameByTimer() {
        // Determine winner by score
        const leftScore = this.players.left.score;
        const rightScore = this.players.right.score;
        let winner;
        if (leftScore > rightScore) winner = 'left';
        else if (rightScore > leftScore) winner = 'right';
        else winner = 'draw';

        this.endGame(winner, 'timer');
    }

    endGame(winner, reason) {
        this.gameActive = false;
        this.clearIntervals();

        this.send({
            type: 'GAME_OVER',
            payload: {
                winner,
                reason,
                players: this.getPlayersState(),
                teamNames: this.teamNames,
                ropeNodes: this.rope.getNodePositions(),
            },
        });

        console.log(`[GameRoom] Game over! Winner: ${winner} (${reason})`);
    }

    resetAndRestart(config = {}) {
        this.clearIntervals();
        this.rope.reset();
        this.difficulty = config.difficulty || this.difficulty;
        this.operations = config.operations || this.operations;
        this.teamNames = config.teamNames || this.teamNames;
        this.players.left = { score: 0, streak: 0, problem: null, choices: [], inputValue: '' };
        this.players.right = { score: 0, streak: 0, problem: null, choices: [], inputValue: '' };
        this.startGame();
    }

    getPlayersState() {
        return {
            left: { score: this.players.left.score, streak: this.players.left.streak },
            right: { score: this.players.right.score, streak: this.players.right.streak },
        };
    }

    clearIntervals() {
        if (this.tickInterval) { clearInterval(this.tickInterval); this.tickInterval = null; }
        if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
    }

    destroy() {
        this.gameActive = false;
        this.clearIntervals();
    }
}
