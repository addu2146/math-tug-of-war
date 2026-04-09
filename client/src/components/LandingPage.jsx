import React from 'react';

export default function LandingPage({ onSelectGame }) {
    return (
        <div style={{
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                width: '100%',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: 'clamp(40px, 8vh, 80px) 20px',
                margin: '0 auto'
            }}>
                <header className="animate-pop-in" style={{ textAlign: 'center', marginBottom: 'clamp(32px, 6vh, 64px)', width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                        <div style={{ 
                            background: 'white', 
                            padding: '16px', 
                            borderRadius: '24px', 
                            boxShadow: '0 8px 24px rgba(0,0,0,0.08)'
                        }}>
                            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="6" y1="12" x2="10" y2="12"></line>
                                <line x1="8" y1="10" x2="8" y2="14"></line>
                                <line x1="15" y1="13" x2="15.01" y2="13"></line>
                                <line x1="18" y1="11" x2="18.01" y2="11"></line>
                                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                            </svg>
                        </div>
                    </div>
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                        fontWeight: 900,
                        color: 'var(--text-dark)',
                        marginBottom: '16px',
                        letterSpacing: '-0.03em',
                        lineHeight: 1.1
                    }}>
                        Edu<span style={{ color: 'var(--blue)' }}>Games</span> Portal
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                        color: 'var(--text-light)',
                        maxWidth: '560px',
                        margin: '0 auto',
                        fontWeight: 500,
                        lineHeight: 1.6
                    }}>
                        Interactive, engaging multiplayer learning. Designed with accessible mechanics for classrooms everywhere.
                    </p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
                    gap: 'clamp(16px, 4vw, 32px)',
                    width: '100%',
                    maxWidth: '1000px',
                    margin: '0 auto'
                }}>
                    {/* Math Tug of War Card */}
                    <button
                        className="card landing-card animate-slide-up"
                        style={{ animationDelay: '0.1s', animationFillMode: 'both', padding: 'clamp(24px, 5vw, 40px) 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: 'var(--card-shadow)' }}
                        onPointerDown={() => onSelectGame('tug-of-war')}
                    >
                        <div style={{ width: 'clamp(72px, 8vw, 96px)', height: 'clamp(72px, 8vw, 96px)', borderRadius: '24px', background: 'var(--blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--blue)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Math Game">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="M10 10h4"/><path d="M12 8v4"/><path d="M10 16h4"/>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px' }}>Math 🆚 War</h2>
                        <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'var(--text-light)', lineHeight: 1.5, marginBottom: '24px', flex: 1 }}>
                            Compete in real-time arithmetic battles! Correctly solve equations to pull the rope to your side.
                        </p>
                        <div className="btn-game btn-blue" style={{ width: '100%' }}>Play Now →</div>
                    </button>

                    {/* Coming Soon Card 1 */}
                    <div
                        className="card landing-card-locked animate-slide-up"
                        style={{ animationDelay: '0.2s', animationFillMode: 'both', padding: 'clamp(24px, 5vw, 40px) 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                    >
                        <div style={{ width: 'clamp(72px, 8vw, 96px)', height: 'clamp(72px, 8vw, 96px)', borderRadius: '24px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-light)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Coming Soon">
                                <path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/><path d="M14 6h8"/><path d="M14 10h8"/><path d="M14 14h8"/><path d="M14 18h8"/>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px', opacity: 0.6 }}>Spell Weaver</h2>
                        <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'var(--text-light)', lineHeight: 1.5, flex: 1, opacity: 0.8 }}>
                            Test your vocabulary reflexes! Form words to build powerful defensive structures.
                        </p>
                        <div style={{ background: '#e0e0e0', color: 'var(--text-light)', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, width: '100%' }}>Coming Soon ⏳</div>
                    </div>

                    {/* Coming Soon Card 2 */}
                    <div
                        className="card landing-card-locked animate-slide-up"
                        style={{ animationDelay: '0.3s', animationFillMode: 'both', padding: 'clamp(24px, 5vw, 40px) 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
                    >
                        <div style={{ width: 'clamp(72px, 8vw, 96px)', height: 'clamp(72px, 8vw, 96px)', borderRadius: '24px', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: 'var(--text-light)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Word Problems">
                                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                                <path d="M8 7h6M8 11h8M8 15h6"/>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', fontWeight: 900, color: 'var(--text-dark)', marginBottom: '12px', opacity: 0.6 }}>Word Problems</h2>
                        <p style={{ fontSize: 'clamp(0.95rem, 1.5vw, 1.05rem)', color: 'var(--text-light)', lineHeight: 1.5, flex: 1, opacity: 0.8 }}>
                            Simple word problems to make learning more educational and help improve students' problem-solving skills.
                        </p>
                        <div style={{ background: '#e0e0e0', color: 'var(--text-light)', padding: '10px 20px', borderRadius: '12px', fontWeight: 800, width: '100%' }}>Coming Soon ⏳</div>
                    </div>
                </div>

                <footer className="animate-pop-in" style={{ animationDelay: '0.4s', animationFillMode: 'both', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: 'auto', paddingTop: '64px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-light)', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Developed with 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--red)" stroke="var(--red)" strokeWidth="1" aria-label="love">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg> 
                        at GHS Vizer
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', fontWeight: 600, opacity: 0.8 }}>
                        <span>&copy; 2026 EduGames</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Contact Developer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 3.4L3 21"/><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1"/></svg>
                            +91 99062 78589
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

