import React, { useState } from 'react';
import GameLayout from './components/GameLayout.jsx';
import LandscapePrompt from './components/LandscapePrompt.jsx';
import LandingPage from './components/LandingPage.jsx';

const enterFullscreen = () => {
    try {
        const doc = document.documentElement;
        if (!document.fullscreenElement && doc.requestFullscreen) {
            doc.requestFullscreen().catch(err => console.warn(err));
        } else if (!document.fullscreenElement && doc.webkitRequestFullscreen) {
            doc.webkitRequestFullscreen().catch(err => console.warn(err));
        }
    } catch (e) {}
};

export default function App() {
    const [currentView, setCurrentView] = useState('landing');
    const [gameMode, setGameMode] = useState(null); // 'local', 'host', or 'join'
    const [roomToJoin, setRoomToJoin] = useState(null);

    // Check URL for ?room=XYZ
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const room = params.get('room');
        if (room) {
            setGameMode('join');
            setRoomToJoin(room);
            setCurrentView('tug-of-war');
            
            // Clean up URL without reloading
            const url = new URL(window.location);
            url.searchParams.delete('room');
            window.history.pushState({}, '', url);

            // Enable fullscreen on user's first interaction
            const enableFS = () => {
                enterFullscreen();
                document.removeEventListener('pointerdown', enableFS);
            };
            document.addEventListener('pointerdown', enableFS);
        }
    }, []);

    const handleSelectGame = (gameId) => {
        enterFullscreen();
        setGameMode(null);
        setCurrentView(gameId);
    };

    return (
        <div className="game-wrapper" style={{ width: '100%', height: '100%' }}>
            <LandscapePrompt />
            <div className="game-container" style={{ width: '100%', height: '100%' }}>
                {currentView === 'landing' && (
                    <LandingPage onSelectGame={handleSelectGame} />
                )}
                {currentView === 'tug-of-war' && (
                    <GameLayout 
                        mode={gameMode} 
                        roomToJoin={roomToJoin}
                        onSelectMode={(m, room) => {
                            enterFullscreen();
                            setGameMode(m);
                            if (room) setRoomToJoin(room);
                        }}
                        onBackToMenu={() => {
                            setCurrentView('landing');
                            setGameMode(null);
                            setRoomToJoin(null);
                        }} 
                    />
                )}
            </div>
        </div>
    );
}
