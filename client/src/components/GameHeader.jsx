/**
 * GameHeader — Top bar with game title.
 */

import React from 'react';

export default function GameHeader() {
    return (
        <div style={{
            background: 'var(--blue)',
            padding: '10px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 20,
            position: 'relative',
        }}>
            <h1 style={{
                color: 'white',
                fontSize: '1.3rem',
                fontWeight: 900,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                margin: 0,
            }}>
                TUG OF WAR: MATHEMATICS
            </h1>
        </div>
    );
}
