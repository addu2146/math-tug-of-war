import React, { useState } from 'react';
import GameHeader from './GameHeader.jsx';

export default function ModeSelector({ onSelectMode, onBack }) {
    const [joinInputVisible, setJoinInputVisible] = useState(false);
    const [roomCode, setRoomCode] = useState('');

    const handleJoinClick = () => {
        if (!joinInputVisible) {
            setJoinInputVisible(true);
        } else if (roomCode.trim().length >= 4) {
            onSelectMode('join', roomCode.trim().toUpperCase());
        }
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <GameHeader onBack={onBack} />
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(20px, 4vh, 40px)',
                margin: '0 auto',
                width: '100%',
                maxWidth: '1200px'
            }}>
                <header className="animate-pop-in" style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vh, 48px)', width: '100%' }}>
                    <h1 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 900,
                        color: 'var(--text-dark)',
                        marginBottom: '16px',
                        letterSpacing: '-0.02em',
                    }}>
                        Select Game <span style={{ color: 'var(--blue)' }}>Mode</span>
                    </h1>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                    gap: 'clamp(16px, 4vw, 32px)',
                    width: '100%',
                }}>
                    {/* Math Tug of War - Local */}
                    <button
                        className="card landing-card animate-slide-up"
                        style={{ animationDelay: '0.1s', animationFillMode: 'both', padding: 'clamp(24px, 5vw, 40px) 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}
                        onPointerDown={() => onSelectMode('local')}
                    >
                        <div style={{ width: 'clamp(72px, 8vw, 96px)', height: 'clamp(72px, 8vw, 96px)', borderRadius: '24px', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--blue)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Math Game Local">
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                                <path d="M12 12v.01" />
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px' }}>Local Play</h2>
                        <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'var(--text-light)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>
                            Play Math Tug-of-War on a single screen! Both teams use the same device.
                        </p>
                        <div className="btn-game btn-blue" style={{ width: '100%', padding: '16px' }}>Play Local →</div>
                    </button>

                    {/* Math Tug of War - Host */}
                    <button
                        className="card landing-card animate-slide-up"
                        style={{ animationDelay: '0.2s', animationFillMode: 'both', padding: 'clamp(24px, 5vw, 40px) 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}
                        onPointerDown={() => onSelectMode('host')}
                    >
                        <div style={{ width: 'clamp(72px, 8vw, 96px)', height: 'clamp(72px, 8vw, 96px)', borderRadius: '24px', background: 'rgba(255, 107, 107, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--red)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Host Game">
                                <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px' }}>Host Game</h2>
                        <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'var(--text-light)', lineHeight: 1.5, flex: 1 }}>
                            Create a network room. A code and QR will be generated for your opponent to join.
                        </p>
                        <div className="btn-game" style={{ backgroundColor: 'var(--red)', color: 'white', width: '100%', marginTop: '24px', padding: '16px' }}>Create Room →</div>
                    </button>

                    {/* Math Tug of War - Join */}
                    <div
                        className="card landing-card animate-slide-up"
                        style={{ animationDelay: '0.3s', animationFillMode: 'both', padding: 'clamp(24px, 5vw, 40px) 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}
                    >
                        <div style={{ width: 'clamp(72px, 8vw, 96px)', height: 'clamp(72px, 8vw, 96px)', borderRadius: '24px', background: 'rgba(76, 175, 80, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--green)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Join Game">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px' }}>Join Game</h2>
                        
                        {!joinInputVisible ? (
                            <>
                                <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'var(--text-light)', lineHeight: 1.5, flex: 1 }}>
                                    Have a room code? Enter it to join a live Math Tug-of-War network battle against another team!
                                </p>
                                <button onPointerDown={handleJoinClick} className="btn-game" style={{ backgroundColor: 'var(--green)', color: 'white', width: '100%', marginTop: '24px', padding: '16px' }}>Join Room →</button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', flex: 1, justifyContent: 'flex-end' }}>
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Enter Room Code" 
                                    maxLength={6}
                                    value={roomCode}
                                    onChange={e => setRoomCode(e.target.value.toUpperCase())}
                                    style={{
                                        padding: '16px', fontSize: '1.5rem', textAlign: 'center', borderRadius: '12px', 
                                        border: '2px solid var(--green)', textTransform: 'uppercase', width: '100%', boxSizing: 'border-box',
                                        letterSpacing: '2px', fontWeight: 600
                                    }} 
                                />
                                <button onPointerDown={handleJoinClick} className="btn-game" disabled={roomCode.trim().length < 4} style={{ backgroundColor: 'var(--green)', color: 'white', width: '100%', padding: '16px', opacity: roomCode.trim().length < 4 ? 0.5 : 1 }}>
                                    Confirm Join →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}