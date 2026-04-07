/**
 * GameHeader — Top bar with game title.
 */

import React from 'react';

export default function GameHeader({ onBack }) {
    return (
        <div className="game-header" style={{
            background: 'var(--blue)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 20,
            position: 'relative',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', minWidth: '100px' }}>
                {onBack && (
                    <button 
                        className="btn-game"
                        onClick={onBack}
                        style={{
                            background: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Back"><path d="m15 18-6-6 6-6"/></svg>
                        Back
                    </button>
                )}
            </div>
            
            <h1 className="game-header-title" style={{
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: 900,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                margin: 0,
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Developed with 
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--red)" stroke="var(--red)" strokeWidth="1" xmlns="http://www.w3.org/2000/svg" aria-label="love">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg> 
                    at GHS Vizer
                </span>
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', minWidth: '100px' }}>
                {/* Spacer to balance the header layout */}
            </div>
        </div>
    );
}
