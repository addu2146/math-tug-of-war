/**
 * ScoreBar — Horizontal progress bar showing rope tug progress.
 * Centered = even. Left of center = Player 1 winning. Right = Player 2.
 */

import React from 'react';

export default function ScoreBar({ progress }) {
    // progress: -1 (P1 winning) to +1 (P2 winning), 0 = center
    const normalizedProgress = Math.max(-1, Math.min(1, progress));
    const percentage = ((normalizedProgress + 1) / 2) * 100;

    return (
        <div style={{
            width: '100%',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            position: 'relative',
            overflow: 'hidden',
            zIndex: 20,
        }}>
            {/* Left color fill */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${percentage}%`,
                background: 'linear-gradient(90deg, var(--color-p1-accent), transparent)',
                transition: 'width 0.1s ease',
            }} />

            {/* Right color fill */}
            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                height: '100%',
                width: `${100 - percentage}%`,
                background: 'linear-gradient(270deg, var(--color-p2-accent), transparent)',
                transition: 'width 0.1s ease',
            }} />

            {/* Center marker */}
            <div style={{
                position: 'absolute',
                left: `${percentage}%`,
                top: '-4px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ffd700',
                border: '2px solid rgba(0,0,0,0.3)',
                transform: 'translateX(-50%)',
                transition: 'left 0.1s ease',
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)',
                zIndex: 1,
            }} />
        </div>
    );
}
