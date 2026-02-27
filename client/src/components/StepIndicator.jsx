/**
 * StepIndicator — Numbered step circles with connecting lines.
 */

import React from 'react';

const STEPS = [
    { num: 1, label: 'Operations' },
    { num: 2, label: 'Difficulty' },
    { num: 3, label: 'Teams' },
];

export default function StepIndicator({ currentStep }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0',
        }}>
            {STEPS.map((s, i) => (
                <React.Fragment key={s.num}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: currentStep >= s.num ? 'var(--blue)' : '#e0e0e0',
                            color: currentStep >= s.num ? 'white' : 'var(--text-light)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '1rem',
                            transition: 'background 0.2s ease',
                        }}>
                            {s.num}
                        </div>
                        <span style={{
                            fontSize: '0.75rem', fontWeight: currentStep === s.num ? 700 : 500,
                            color: currentStep === s.num ? 'var(--text-dark)' : 'var(--text-light)',
                        }}>
                            {s.label}
                        </span>
                    </div>
                    {i < STEPS.length - 1 && (
                        <div style={{
                            width: '50px', height: '2px', marginBottom: '18px',
                            background: currentStep > s.num ? 'var(--blue)' : '#e0e0e0',
                            transition: 'background 0.2s ease',
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
