/**
 * CenterPanel — Shows team scores, timer, and hosts the Phaser canvas.
 * Matches the reference design: scores at top corners, timer centered,
 * tug-of-war illustration in the main area.
 */

import React from 'react';

export default function CenterPanel({
    leftScore,
    rightScore,
    leftTeamName,
    rightTeamName,
    timeRemaining,
}) {
    const minutes = Math.floor(Math.max(0, timeRemaining) / 60);
    const seconds = Math.max(0, timeRemaining) % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const isLowTime = timeRemaining <= 10;

    return (
        <div style={{
            flex: 1.2,
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none', // Let clicks pass through center background
        }}>
            {/* Score Header - Glassmorphic floating pill */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'min(10px, 1vh) 24px',
                background: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                borderRadius: '30px',
                border: '1px solid rgba(255, 255, 255, 0.6)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.05)',
                width: '100%',
                maxWidth: '450px',
                marginTop: '10px',
            }}>
                {/* Left team score */}
                <div style={{ textAlign: 'left', minWidth: '60px' }}>
                    <div className="team-name" style={{ fontSize: 'clamp(0.7rem, 1.5vh, 0.8rem)', fontWeight: 800, color: 'var(--blue-dark)' }}>
                        {leftTeamName}
                    </div>
                    <div className="score-val" style={{ fontSize: 'clamp(1.4rem, 3.5vh, 1.8rem)', fontWeight: 900, color: 'var(--blue)' }}>
                        {leftScore}
                    </div>
                </div>

                {/* Timer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: isLowTime ? 'rgba(211, 47, 47, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                }}>
                    <span style={{ fontSize: 'clamp(1rem, 2.5vh, 1.2rem)' }}>⏱</span>
                    <span className={`timer-val ${isLowTime ? 'animate-pulse' : ''}`} style={{
                        fontSize: 'clamp(1.2rem, 3vh, 1.5rem)',
                        fontWeight: 900,
                        color: isLowTime ? 'var(--red)' : 'var(--text-dark)',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {timeStr}
                    </span>
                </div>

                {/* Right team score */}
                <div style={{ textAlign: 'right', minWidth: '60px' }}>
                    <div className="team-name" style={{ fontSize: 'clamp(0.7rem, 1.5vh, 0.8rem)', fontWeight: 800, color: 'var(--red-dark)' }}>
                        {rightTeamName}
                    </div>
                    <div className="score-val" style={{ fontSize: 'clamp(1.4rem, 3.5vh, 1.8rem)', fontWeight: 900, color: 'var(--red)' }}>
                        {rightScore}
                    </div>
                </div>
            </div>
        </div>
    );
}
