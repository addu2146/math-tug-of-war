/**
 * SetupWizard — 3-step game configuration wizard.
 * Step 1: Operations (Add/Sub/Mul/Div)
 * Step 2: Difficulty (Easy/Medium/Hard)
 * Step 3: Teams (Team names)
 *
 * Per @kid-friendly-a11y: all buttons ≥ 64px, onPointerDown, sans-serif ≥ 24px.
 */

import React, { useState, useCallback } from 'react';
import StepIndicator from './StepIndicator.jsx';

const OPERATIONS = [
    { key: 'add', label: 'Addition', icon: '+' },
    { key: 'sub', label: 'Subtraction', icon: '−' },
    { key: 'mul', label: 'Multiplication', icon: '×' },
];

const DIFFICULTIES = [
    { key: 1, label: 'Easy', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Easy"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M2 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="M12 20v2"/><path d="m19.07 19.07-1.41-1.41"/><path d="M22 12h-2"/><path d="m19.07 4.93-1.41 1.41"/><circle cx="12" cy="12" r="4"/></svg>, desc: 'Numbers 1-12' },
    { key: 2, label: 'Medium', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Medium"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>, desc: 'Numbers 1-20' },
    { key: 3, label: 'Hard', icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Hard"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>, desc: 'Multiply 2-12' },
];

export default function SetupWizard({ mode = 'local', onStartGame, onBack }) {
    const [step, setStep] = useState(1);
    const [selectedOps, setSelectedOps] = useState(['add']);
    const [difficulty, setDifficulty] = useState(1);
    const [teamNames, setTeamNames] = useState({ left: '', right: '' });

    const toggleOp = useCallback((key) => {
        setSelectedOps((prev) => {
            if (prev.includes(key)) {
                return prev.length > 1 ? prev.filter((o) => o !== key) : prev;
            }
            return [...prev, key];
        });
    }, []);

    const handleStart = useCallback(() => {
        onStartGame({
            operations: selectedOps,
            difficulty,
            teamNames: {
                left: teamNames.left || 'Team 1 (Blue)',
                right: teamNames.right || 'Team 2 (Red)',
            },
        });
    }, [selectedOps, difficulty, teamNames, onStartGame]);

    return (
        <div className="setup-wrapper" style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 'clamp(16px, 3vh, 32px)',
            overflowY: 'auto',
            overflowX: 'hidden'
        }}>
            <div className="card wizard-card animate-pop-in" style={{
                width: '100%',
                maxWidth: '600px',
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(20px, 4vw, 36px)',
                margin: 'auto'
            }}>
                {/* Title */}
                <h1 className="setup-title" style={{
                    textAlign: 'center',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    color: 'var(--blue)',
                    marginBottom: '20px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                }}>
                    Prepare Your Teams
                </h1>

                {/* Step Indicator */}
                <StepIndicator currentStep={step} />

                {/* Step Content */}
                <div className="step-content" style={{
                    marginTop: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    flex: 1,
                    overflowY: 'auto',
                    minHeight: 0,
                    paddingRight: '8px'
                }}>
                    {step === 1 && (
                        <div className="animate-slide-up">
                            <h2 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                                Operations
                            </h2>
                            <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '20px', fontSize: '0.95rem' }}>
                                Select one or more operations
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'clamp(8px, 2vh, 12px)' }}>
                                {OPERATIONS.map((op) => (
                                    <button
                                        key={op.key}
                                        className={`btn-game op-button ${selectedOps.includes(op.key) ? 'btn-outline-selected' : 'btn-ghost-dark'}`}
                                        onPointerDown={(e) => { toggleOp(op.key); }}
                                        style={{ width: '100%', justifyContent: 'flex-start', padding: 'clamp(8px, 2vh, 16px) clamp(12px, 4vw, 24px)' }}
                                    >
                                        <span style={{
                                            width: '32px', height: '32px', borderRadius: '50%',
                                            background: selectedOps.includes(op.key) ? 'var(--blue)' : '#e0e0e0',
                                            color: selectedOps.includes(op.key) ? 'white' : 'var(--text-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.1rem', fontWeight: 900, flexShrink: 0,
                                        }}>
                                            {op.icon}
                                        </span>
                                        <span style={{ fontSize: '1rem', fontWeight: 700 }}>{op.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="animate-slide-up">
                            <h2 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                                Difficulty Level
                            </h2>
                            <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '20px', fontSize: '0.95rem' }}>
                                Choose the challenge level
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.key}
                                        className={`btn-game ${difficulty === d.key ? 'btn-outline-selected' : 'btn-ghost-dark'}`}
                                        onPointerDown={(e) => { setDifficulty(d.key); }}
                                        style={{
                                            flex: 1, flexDirection: 'column', padding: '16px 8px',
                                            textAlign: 'center', justifyContent: 'center', height: '100%', gap: '8px'
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{d.icon}</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>{d.label}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 'normal' }}>{d.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="animate-slide-up">
                            <h2 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
                                Team Names
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 'min(12px, 2vw)' }}>
                                {/* Team 1 Blue */}
                                <div className="team-input-box" style={{
                                    border: '2px solid var(--blue)', borderRadius: '12px',
                                    padding: '16px', textAlign: 'center',
                                }}>
                                    <div style={{ color: 'var(--blue)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Team 1"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    <div style={{ fontWeight: 800, color: 'var(--blue)', marginBottom: '12px', fontSize: '0.85rem' }}>
                                        TEAM 1 (BLUE)
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Team name"
                                        className="answer-input"
                                        value={teamNames.left}
                                        onChange={(e) => setTeamNames((t) => ({ ...t, left: e.target.value }))}
                                        style={{ fontSize: '0.95rem', fontWeight: 600, pointerEvents: 'auto', userSelect: 'text', width: '100%', boxSizing: 'border-box', padding: '8px' }}
                                    />
                                </div>

                                {/* Team 2 Red */}
                                {mode === 'local' && (
                                    <div className="team-input-box" style={{
                                        border: '2px solid var(--red)', borderRadius: '12px',
                                        padding: '16px', textAlign: 'center',
                                    }}>
                                        <div style={{ color: 'var(--red)', marginBottom: '6px', display: 'flex', justifyContent: 'center' }}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Team 2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                        </div>
                                        <div style={{ fontWeight: 800, color: 'var(--red)', marginBottom: '12px', fontSize: '0.85rem' }}>
                                            TEAM 2 (RED)
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Team name"
                                            className="answer-input"
                                            value={teamNames.right}
                                            onChange={(e) => setTeamNames((t) => ({ ...t, right: e.target.value }))}
                                            style={{ fontSize: '0.95rem', fontWeight: 600, pointerEvents: 'auto', userSelect: 'text', width: '100%', boxSizing: 'border-box', padding: '8px' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div style={{
                    display: 'flex', gap: '12px', marginTop: 'clamp(20px, 4vh, 28px)',
                    justifyContent: step === 1 ? 'flex-end' : 'space-between',
                }}>
                    {step > 1 && (
                        <button
                            className="btn-game btn-ghost-dark"
                            onPointerDown={(e) => { setStep((s) => s - 1); }}
                            style={{ padding: 'clamp(10px, 2vh, 12px) clamp(16px, 4vw, 28px)' }}
                        >
                            ← BACK
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            className="btn-game btn-blue"
                            onPointerDown={(e) => { setStep((s) => s + 1); }}
                            style={{ flex: 1, maxWidth: '300px', padding: 'clamp(10px, 2vh, 12px) 20px' }}
                        >
                            NEXT →
                        </button>
                    ) : (
                        <button
                            className="btn-game btn-blue"
                            onPointerDown={(e) => { handleStart(); }}
                            style={{ flex: 1, maxWidth: '300px', padding: 'clamp(10px, 2vh, 12px) 20px' }}
                        >
                            ▶ START GAME
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
