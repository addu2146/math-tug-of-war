/**
 * AnswerButton — Kid-friendly answer button with visual feedback.
 * 
 * Per @kid-friendly-a11y skill:
 * - Minimum 64×64px touch target
 * - Uses onPointerDown (not onClick) for immediate response
 * - Sans-serif font ≥ 24px
 */

import React, { useState, useCallback } from 'react';

export default function AnswerButton({ value, onAnswer, disabled, answerResult }) {
    const [isPressed, setIsPressed] = useState(false);

    const handlePointerDown = useCallback((e) => {
        e.preventDefault();
        if (disabled) return;
        setIsPressed(true);
        onAnswer(value);
        setTimeout(() => setIsPressed(false), 150);
    }, [value, onAnswer, disabled]);

    // Determine visual state
    let stateClass = '';
    if (answerResult === 'correct') {
        stateClass = 'animate-flash-correct';
    } else if (answerResult === 'incorrect') {
        stateClass = 'animate-shake';
    }

    return (
        <button
            className={`btn-answer ${stateClass}`}
            onPointerDown={handlePointerDown}
            disabled={disabled}
            aria-label={`Answer ${value}`}
            style={{
                width: '100%',
                minHeight: '64px',
                minWidth: '64px',
                fontSize: '1.75rem',
                fontWeight: 800,
                opacity: disabled ? 0.5 : 1,
                transform: isPressed ? 'scale(0.92)' : 'scale(1)',
                transition: 'transform 0.1s ease, opacity 0.2s ease',
            }}
        >
            {value}
        </button>
    );
}
