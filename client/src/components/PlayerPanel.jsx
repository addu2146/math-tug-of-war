/**
 * PlayerPanel — White card with colored header, math problem, answer input, numpad.
 * Matches the reference design from edugames.uz.
 *
 * Per @kid-friendly-a11y:
 * - Sans-serif font ≥ 24px for problems
 * - All interactive elements use onPointerDown
 * - touch-action: none on the panel to prevent interference
 */

import React, { useState, useCallback, useEffect } from 'react';
import Numpad from './Numpad.jsx';

export default function PlayerPanel({
    side,
    problem,
    score,
    streak,
    teamName,
    answerResult,
    onSubmitAnswer,
    onClearResult,
    disabled,
}) {
    const [inputValue, setInputValue] = useState('');
    const isLeft = side === 'left';
    const headerBg = isLeft ? 'var(--blue)' : 'var(--red)';
    const problemColor = isLeft ? 'var(--blue)' : 'var(--red)';
    const panelBg = isLeft ? 'var(--blue-light)' : 'var(--red-light)';

    // Clear input when a new problem arrives
    useEffect(() => {
        if (problem) setInputValue('');
    }, [problem?.id]);

    // Clear answer result after animation
    useEffect(() => {
        if (answerResult) {
            const timer = setTimeout(() => {
                if (onClearResult) onClearResult();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [answerResult, onClearResult]);

    const handleKeyPress = useCallback((key) => {
        setInputValue((prev) => {
            if (prev.length >= 6) return prev; // max 6 digits
            return prev + key;
        });
    }, []);

    const handleClear = useCallback(() => {
        setInputValue('');
    }, []);

    const handleSubmit = useCallback(() => {
        if (inputValue === '' || disabled) return;
        onSubmitAnswer(side, Number(inputValue));
        setInputValue('');
    }, [inputValue, side, onSubmitAnswer, disabled]);

    // Determine input visual state
    let inputClass = 'answer-input';
    if (answerResult === 'correct') inputClass += ' answer-input-correct';
    if (answerResult === 'incorrect') inputClass += ' answer-input-incorrect';

    return (
        <div
            className="card"
            style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                background: panelBg,
                touchAction: 'none',
                maxWidth: '320px',
            }}
        >
            {/* Colored Header */}
            <div style={{
                background: headerBg,
                padding: '10px 16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <span style={{
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1rem',
                }}>
                    {teamName || (isLeft ? 'Team 1' : 'Team 2')}
                </span>
                <span style={{
                    background: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    padding: '2px 14px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                }}>
                    {score}
                </span>
            </div>

            {/* Problem + Input + Numpad */}
            <div style={{
                flex: 1,
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                background: 'white',
                margin: '0',
            }}>
                {/* Math Problem */}
                <div className={answerResult === 'incorrect' ? 'animate-shake' : ''} style={{
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: problemColor,
                    padding: '6px 0',
                    lineHeight: 1.2,
                }}>
                    {problem ? `${problem.expression} = ?` : '...'}
                </div>

                {/* Answer Input Display */}
                <div className={inputClass} style={{
                    fontSize: '1.3rem',
                    transition: 'background 0.3s, border-color 0.3s',
                }}>
                    {answerResult === 'correct' ? '✓' : (inputValue || '0')}
                </div>

                {/* Numpad Grid */}
                <Numpad
                    onKeyPress={handleKeyPress}
                    onClear={handleClear}
                    onSubmit={handleSubmit}
                    disabled={disabled || answerResult !== null}
                />

                {/* Streak indicator */}
                {streak > 1 && (
                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: 'var(--gold)',
                    }}>
                        🔥 {streak} streak!
                    </div>
                )}
            </div>
        </div>
    );
}
