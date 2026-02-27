/**
 * Math Problem Generator using mathjs for safe expression evaluation.
 * 
 * Per @math-problem-generator skill:
 * - NEVER use eval() — only mathjs.evaluate()
 * - Enforce strict difficulty bounds
 * - No negative results for subtraction at Level 1
 */

import { evaluate as mathjsEvaluate } from 'mathjs';
import { getDifficultyConfig } from './DifficultyConfig.js';

let problemCounter = 0;

/**
 * Returns a random integer in [min, max] inclusive.
 */
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Maps operation name to its symbol.
 */
const OP_SYMBOLS = {
    add: '+',
    sub: '-',
    mul: '×',
};

const OP_MATHJS = {
    add: '+',
    sub: '-',
    mul: '*',
};

/**
 * Generates a single math problem based on difficulty configuration.
 * 
 * @param {Object} options
 * @param {1|2|3} options.level - Difficulty level
 * @param {string} [options.operation] - Force a specific operation, or random from allowed
 * @returns {{ id: string, expression: string, displayExpression: string, answer: number, level: number, operation: string }}
 */
export function generateProblem({ level = 1, operation = null } = {}) {
    const config = getDifficultyConfig(level);

    // Pick operation
    const op = operation && config.allowedOps.includes(operation)
        ? operation
        : config.allowedOps[randInt(0, config.allowedOps.length - 1)];

    let a = randInt(config.minOperand, config.maxOperand);
    let b = randInt(config.minOperand, config.maxOperand);

    // Subtraction guard: ensure A >= B to prevent negative results
    if (op === 'sub' && a < b) {
        [a, b] = [b, a];
    }

    // Build expression string for mathjs evaluation
    const mathjsExpression = `${a} ${OP_MATHJS[op]} ${b}`;
    const displayExpression = `${a} ${OP_SYMBOLS[op]} ${b}`;

    // Evaluate using mathjs — NEVER eval()
    const answer = mathjsEvaluate(mathjsExpression);

    problemCounter++;

    return {
        id: `prob_${Date.now()}_${problemCounter}`,
        expression: mathjsExpression,
        displayExpression,
        answer: Number(answer),
        level,
        operation: op,
    };
}

/**
 * Generates multiple-choice options for a problem.
 * Returns an array of 4 numbers: 1 correct + 3 distractors.
 * Distractors are guaranteed to be unique and different from the answer.
 */
export function generateChoices(correctAnswer) {
    const choices = new Set([correctAnswer]);

    while (choices.size < 4) {
        // Generate distractors within a reasonable range of the correct answer
        const offset = randInt(1, Math.max(5, Math.abs(correctAnswer)));
        const distractor = correctAnswer + (Math.random() > 0.5 ? offset : -offset);

        // Ensure non-negative for kid-friendliness and no duplicates
        if (distractor >= 0 && !choices.has(distractor)) {
            choices.add(Math.round(distractor));
        }
    }

    // Shuffle the choices using Fisher-Yates
    const choiceArray = Array.from(choices);
    for (let i = choiceArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choiceArray[i], choiceArray[j]] = [choiceArray[j], choiceArray[i]];
    }

    return choiceArray;
}
