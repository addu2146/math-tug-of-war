/**
 * VictoryModal — Light-themed winner announcement overlay.
 */

import React from 'react';

export default function VictoryModal({ winner, players, teamNames, onPlayAgain }) {
    const isDraw = winner === 'draw';
    const winnerName = isDraw ? 'Draw!' : (winner === 'left' ? teamNames?.left : teamNames?.right);
    const winnerColor = isDraw ? 'var(--gold)' : (winner === 'left' ? 'var(--blue)' : 'var(--red)');
    const leftScore = players?.left?.score || 0;
    const rightScore = players?.right?.score || 0;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
        }}>
            <div className="card animate-victory" style={{
                padding: '40px',
                textAlign: 'center',
                maxWidth: '420px',
                width: '90%',
            }}>
                <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                    {isDraw ? (
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Draw" color="var(--gold)"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a2.12 2.12 0 1 0 3-3L15 9l-4.5 4.5"/><path d="m7 7 2 2a1 1 0 1 0 3-3"/><path d="m10 10 2.5 2.5a2.12 2.12 0 1 0 3-3L11 5 6.5 9.5"/></svg>
                    ) : (
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Winner" color={winnerColor}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                    )}
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 900,
                    color: winnerColor,
                    marginBottom: '8px',
                }}>
                    {isDraw ? "It's a Draw!" : `${winnerName} Wins!`}
                </h1>

                {/* Score summary */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '32px',
                    margin: '20px 0',
                    fontSize: '1.1rem',
                }}>
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--blue)', marginBottom: '4px' }}>
                            {teamNames?.left || 'Team 1'}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--blue)' }}>{leftScore}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--text-light)', alignSelf: 'center' }}>vs</div>
                    <div>
                        <div style={{ fontWeight: 700, color: 'var(--red)', marginBottom: '4px' }}>
                            {teamNames?.right || 'Team 2'}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--red)' }}>{rightScore}</div>
                    </div>
                </div>

                <button
                    className="btn-game btn-blue"
                    onPointerDown={(e) => { e.preventDefault(); onPlayAgain(); }}
                    style={{ width: '100%', marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '8px' }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Play Again"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Play Again
                </button>
            </div>
        </div>
    );
}
