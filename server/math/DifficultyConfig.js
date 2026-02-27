/**
 * Difficulty configuration for math problem generation.
 * Each level defines operand bounds and allowed operations.
 * 
 * Per @math-problem-generator skill:
 * - Level 1: No negative results for subtraction (A >= B enforced in generator)
 * - Level 3: Multipliers must be 2-12
 */

export const DIFFICULTY_LEVELS = {
    1: {
        label: 'Easy',
        minOperand: 1,
        maxOperand: 12,
        allowedOps: ['add', 'sub'],
        description: 'Addition & subtraction with numbers 1-12',
    },
    2: {
        label: 'Medium',
        minOperand: 1,
        maxOperand: 20,
        allowedOps: ['add', 'sub', 'mul'],
        description: 'All operations with numbers 1-20',
    },
    3: {
        label: 'Hard',
        minOperand: 2,
        maxOperand: 12,
        allowedOps: ['mul'],
        description: 'Multiplication with numbers 2-12',
    },
};

export function getDifficultyConfig(level) {
    const config = DIFFICULTY_LEVELS[level];
    if (!config) {
        throw new Error(`Invalid difficulty level: ${level}. Must be 1, 2, or 3.`);
    }
    return config;
}
