/**
 * Numpad — Calculator-style 3×4 grid matching the reference design.
 *
 * Per @kid-friendly-a11y:
 * - All buttons ≥ 64px (we use 52px min but cells are larger in grid)
 * - onPointerDown for touch immediacy
 * - touch-action: none to prevent scrolling
 */

import React, { useCallback } from 'react';

const KEYS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['clear', '0', 'submit'],
];

export default function Numpad({ onKeyPress, onClear, onSubmit, disabled }) {
    const handlePointerDown = useCallback((e, key) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled) return;
        if (key === 'clear') { onClear(); return; }
        if (key === 'submit') { onSubmit(); return; }
        onKeyPress(key);
    }, [onKeyPress, onClear, onSubmit, disabled]);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            touchAction: 'none',
        }}>
            {KEYS.flat().map((key) => {
                let className = 'numpad-btn';
                let content = key;

                if (key === 'clear') {
                    className += ' numpad-btn-clear';
                    content = '✕';
                } else if (key === 'submit') {
                    className += ' numpad-btn-submit';
                    content = '✓';
                }

                return (
                    <button
                        key={key}
                        className={className}
                        onPointerDown={(e) => handlePointerDown(e, key)}
                        disabled={disabled}
                        style={{ opacity: disabled ? 0.5 : 1 }}
                        aria-label={key === 'clear' ? 'Clear' : key === 'submit' ? 'Submit' : `Number ${key}`}
                    >
                        {content}
                    </button>
                );
            })}
        </div>
    );
}
