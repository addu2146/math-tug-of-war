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
    onRageQuit,
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
                background: isLeft ? 'rgba(227, 242, 253, 0.4)' : 'rgba(255, 235, 238, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: isLeft ? '2px solid rgba(227, 242, 253, 0.8)' : '2px solid rgba(255, 235, 238, 0.8)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                touchAction: 'none',
                maxWidth: '320px',
                minHeight: 0,
            }}
        >
            {/* Colored Header */}
            <div className="player-panel-header" style={{
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
            <div className="player-panel-body" style={{
                flex: 1,
                padding: 'min(6px, 1.5vh) min(8px, 1.5vw)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'min(6px, 1vh)',
                background: 'transparent',
                margin: '0',
                minHeight: 0,
            }}>
                {/* Streak indicator - High visibility area */}
                {streak > 1 && (
                    <div className="streak-indicator" style={{
                        textAlign: 'center',
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: streak >= 6 ? '#00e5ff' : streak >= 4 ? '#ff3300' : '#ffa500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        margin: '-4px 0 min(4px, 0.5vh)'
                    }}>
                        <svg 
                            width={streak >= 6 ? "42" : streak >= 4 ? "36" : "30"} 
                            height={streak >= 6 ? "42" : streak >= 4 ? "36" : "30"} 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            stroke="none" 
                            aria-label="Fire"
                            style={{
                                filter: streak >= 6 ? 'drop-shadow(0 0 8px #00e5ff)' : streak >= 4 ? 'drop-shadow(0 0 6px #ff3300)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <path d="M17.5 11.5c-1.5-1.5-2.5-4-2-6-3.5 2-4 6-3.5 8 0 0-2-1.5-2-4-2.5 2.5-4 7-2 10.5 1.5 2.5 4.5 4 7.5 4s6-1.5 7.5-4c2-3.5.5-8-2-10.5-1.5 1-2.5 1.5-3.5 2z" />
                        </svg>
                        <span>{streak}</span>
                    </div>
                )}

                {/* Math Problem */}
                <div className={`math-problem ${answerResult === 'incorrect' ? 'animate-shake' : ''}`} style={{
                    textAlign: 'center',
                    fontSize: 'clamp(1.4rem, 4vh, 1.8rem)',
                    fontWeight: 900,
                    color: problemColor,
                    padding: 'min(6px, 1vh) 0',
                    lineHeight: 1.2,
                }}>
                    {problem ? `${problem.expression} = ?` : '...'}
                </div>

                {/* Answer Input Display */}
                <div className={inputClass} style={{
                    fontSize: 'clamp(1.1rem, 3vh, 1.3rem)',
                    transition: 'background 0.3s, border-color 0.3s',
                    minHeight: 'min(40px, 5vh)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
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

                {/* Team Rage Quit / Forfeit Button */}
                <button
                    onPointerDown={() => { if(onRageQuit && !disabled) onRageQuit(side); }}
                    className="btn-game animate-pulse rage-quit-btn"
                    disabled={disabled}
                    style={{
                        marginTop: 'auto',
                        background: 'transparent',
                        color: 'var(--red)',
                        border: '2px solid var(--red)',
                        display: disabled ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        transition: 'all 0.2s',
                        boxShadow: 'none'
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Forfeit"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    Rage Quit
                </button>
            </div>
        </div>
    );
}
