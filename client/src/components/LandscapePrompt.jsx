import React from 'react';

export default function LandscapePrompt() {
    return (
        <div id="landscape-prompt" style={{
            display: 'none', // Hidden by default, shown via CSS media query
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'var(--blue)',
            color: 'white',
            zIndex: 9999,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem',
        }}>
            <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                animation: 'rotate-phone 2s ease-in-out infinite',
            }}>
                📱
            </div>
            <h1 style={{
                fontSize: '2rem',
                fontWeight: 900,
                marginBottom: '1rem',
            }}>
                ROTATE DEVICE
            </h1>
            <p style={{
                fontSize: '1.2rem',
                fontWeight: 600,
                maxWidth: '80%',
            }}>
                This game requires Landscape mode to play. Please rotate your phone or tablet.
            </p>
        </div>
    );
}
