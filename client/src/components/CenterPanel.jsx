/**
 * CenterPanel — Shows team scores, timer, and hosts the Phaser canvas.
 * Matches the reference design: scores at top corners, timer centered,
 * tug-of-war illustration in the main area.
 */

import React from 'react';
import PhaserGame from '../game/PhaserGame.jsx';

export default function CenterPanel({
    leftScore,
    rightScore,
    leftTeamName,
    rightTeamName,
    timeRemaining,
    phaserRef,
}) {
    const minutes = Math.floor(Math.max(0, timeRemaining) / 60);
    const seconds = Math.max(0, timeRemaining) % 60;
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    const isLowTime = timeRemaining <= 10;

    return (
        <div className="card" style={{
            flex: 1.2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: 0,
        }}>
            {/* Score Header */}
            <div className="center-panel-header" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'min(10px, 1vh) 20px',
                borderBottom: '1px solid var(--border-light)',
                background: '#fafafa',
            }}>
                {/* Left team score */}
                <div style={{ textAlign: 'left' }}>
                    <div className="team-name" style={{ fontSize: 'clamp(0.7rem, 1.5vh, 0.8rem)', fontWeight: 600, color: 'var(--text-light)' }}>
                        {leftTeamName}
                    </div>
                    <div className="score-val" style={{ fontSize: 'clamp(1.2rem, 3vh, 1.5rem)', fontWeight: 900, color: 'var(--blue)' }}>
                        {leftScore}
                    </div>
                </div>

                {/* Timer */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                    <span style={{ fontSize: 'clamp(0.9rem, 2vh, 1.1rem)' }}>⏱</span>
                    <span className={`timer-val ${isLowTime ? 'animate-pulse' : ''}`} style={{
                        fontSize: 'clamp(1rem, 2.5vh, 1.3rem)',
                        fontWeight: 800,
                        color: isLowTime ? 'var(--red)' : 'var(--text-dark)',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {timeStr}
                    </span>
                </div>

                {/* Right team score */}
                <div style={{ textAlign: 'right' }}>
                    <div className="team-name" style={{ fontSize: 'clamp(0.7rem, 1.5vh, 0.8rem)', fontWeight: 600, color: 'var(--text-light)' }}>
                        {rightTeamName}
                    </div>
                    <div className="score-val" style={{ fontSize: 'clamp(1.2rem, 3vh, 1.5rem)', fontWeight: 900, color: 'var(--red)' }}>
                        {rightScore}
                    </div>
                </div>
            </div>

            {/* Phaser Canvas Area */}
            <div style={{
                flex: 1,
                position: 'relative',
                background: '#fdfdfd',
                overflow: 'hidden',
            }}>
                <PhaserGame ref={phaserRef} />
            </div>
        </div>
    );
}
