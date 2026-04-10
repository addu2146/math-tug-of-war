import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function WaitingRoom({ roomCode }) {
    const joinUrl = `${window.location.origin}/?room=${roomCode}`;

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center'
        }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--blue)', marginBottom: '16px' }}>
                Waiting for Challenger...
            </h1>
            
            <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', marginBottom: '32px' }}>
                Ask the other team to join using this Room Code:
            </p>

            <div style={{
                background: 'white',
                padding: '16px 32px',
                borderRadius: '16px',
                border: '4px dashed var(--blue)',
                fontSize: '3rem',
                fontWeight: 900,
                letterSpacing: '0.2em',
                marginBottom: '32px',
                color: 'var(--text-dark)'
            }}>
                {roomCode}
            </div>

            <div style={{
                background: 'white',
                padding: '16px',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
                <QRCodeSVG value={joinUrl} size={200} />
            </div>

            <p style={{ marginTop: '24px', color: 'var(--text-light)' }}>
                Or scan the QR code to join directly.
            </p>
        </div>
    );
}