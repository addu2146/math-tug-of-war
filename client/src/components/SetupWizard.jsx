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
    { key: 1, label: 'Easy', icon: '💡', desc: 'Numbers 1-12' },
    { key: 2, label: 'Medium', icon: '🧠', desc: 'Numbers 1-20' },
    { key: 3, label: 'Hard', icon: '🏋️', desc: 'Multiply 2-12' },
];

export default function SetupWizard({ onStartGame }) {
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
            padding: '16px',
            overflowY: 'auto',
        }}>
            <div className="card wizard-card animate-pop-in" style={{
                width: '100%',
                maxWidth: '600px',
                padding: '36px',
                margin: 'auto',
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
                <div className="step-content" style={{ marginTop: '24px', minHeight: '220px' }}>
                    {step === 1 && (
                        <div className="animate-slide-up">
                            <h2 style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
                                Operations
                            </h2>
                            <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '20px', fontSize: '0.95rem' }}>
                                Select one or more operations
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {OPERATIONS.map((op) => (
                                    <button
                                        key={op.key}
                                        className={`wizard-btn ${selectedOps.includes(op.key) ? 'wizard-btn-selected' : ''}`}
                                        onPointerDown={(e) => { toggleOp(op.key); }}
                                        style={{ width: '100%' }}
                                    >
                                        <span style={{
                                            width: '40px', height: '40px', borderRadius: '50%',
                                            background: selectedOps.includes(op.key) ? 'var(--blue)' : '#e0e0e0',
                                            color: selectedOps.includes(op.key) ? 'white' : 'var(--text-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.3rem', fontWeight: 900, flexShrink: 0,
                                        }}>
                                            {op.icon}
                                        </span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{op.label}</span>
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
                            <div style={{ display: 'flex', gap: '12px' }}>
                                {DIFFICULTIES.map((d) => (
                                    <button
                                        key={d.key}
                                        className={`wizard-btn ${difficulty === d.key ? 'wizard-btn-selected' : ''}`}
                                        onPointerDown={(e) => { setDifficulty(d.key); }}
                                        style={{
                                            flex: 1, flexDirection: 'column', padding: '16px 8px',
                                            textAlign: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <span style={{ fontSize: '2rem' }}>{d.icon}</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 800 }}>{d.label}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{d.desc}</span>
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
                            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                {/* Team 1 Blue */}
                                <div className="team-input-box" style={{
                                    flex: 1, border: '2px solid var(--blue)', borderRadius: '12px',
                                    padding: '20px', textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>👥</div>
                                    <div style={{ fontWeight: 800, color: 'var(--blue)', marginBottom: '12px', fontSize: '0.95rem' }}>
                                        TEAM 1 (BLUE)
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Team name"
                                        className="answer-input"
                                        value={teamNames.left}
                                        onChange={(e) => setTeamNames((t) => ({ ...t, left: e.target.value }))}
                                        style={{ fontSize: '1rem', fontWeight: 600, pointerEvents: 'auto', userSelect: 'text' }}
                                    />
                                </div>

                                <span style={{ fontWeight: 900, color: 'var(--blue)', fontSize: '1.5rem' }}>VS</span>

                                {/* Team 2 Red */}
                                <div className="team-input-box" style={{
                                    flex: 1, border: '2px solid var(--red)', borderRadius: '12px',
                                    padding: '20px', textAlign: 'center',
                                }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '6px' }}>👥</div>
                                    <div style={{ fontWeight: 800, color: 'var(--red)', marginBottom: '12px', fontSize: '0.95rem' }}>
                                        TEAM 2 (RED)
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Team name"
                                        className="answer-input"
                                        value={teamNames.right}
                                        onChange={(e) => setTeamNames((t) => ({ ...t, right: e.target.value }))}
                                        style={{ fontSize: '1rem', fontWeight: 600, pointerEvents: 'auto', userSelect: 'text' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <div style={{
                    display: 'flex', gap: '12px', marginTop: '28px',
                    justifyContent: step === 1 ? 'flex-end' : 'space-between',
                }}>
                    {step > 1 && (
                        <button
                            className="wizard-btn"
                            onPointerDown={(e) => { setStep((s) => s - 1); }}
                            style={{ padding: '12px 28px' }}
                        >
                            ← BACK
                        </button>
                    )}
                    {step < 3 ? (
                        <button
                            className="wizard-btn wizard-btn-primary"
                            onPointerDown={(e) => { setStep((s) => s + 1); }}
                            style={{ flex: 1, maxWidth: '300px' }}
                        >
                            NEXT →
                        </button>
                    ) : (
                        <button
                            className="wizard-btn wizard-btn-primary"
                            onPointerDown={(e) => { handleStart(); }}
                            style={{ flex: 1, maxWidth: '300px' }}
                        >
                            ▶ START GAME
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
