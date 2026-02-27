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
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>
                    {isDraw ? '🤝' : '🏆'}
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
                    className="wizard-btn wizard-btn-primary"
                    onPointerDown={(e) => { e.preventDefault(); onPlayAgain(); }}
                    style={{ width: '100%', marginTop: '8px' }}
                >
                    🔄 Play Again
                </button>
            </div>
        </div>
    );
}
