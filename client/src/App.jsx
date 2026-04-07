import React, { useState } from 'react';
import GameLayout from './components/GameLayout.jsx';
import LandscapePrompt from './components/LandscapePrompt.jsx';
import LandingPage from './components/LandingPage.jsx';

export default function App() {
    const [currentView, setCurrentView] = useState('landing');

    return (
        <div className="game-wrapper" style={{ width: '100%', height: '100%' }}>
            <LandscapePrompt />
            <div className="game-container" style={{ width: '100%', height: '100%' }}>
                {currentView === 'landing' && (
                    <LandingPage onSelectGame={(gameId) => setCurrentView(gameId)} />
                )}
                {currentView === 'tug-of-war' && (
                    <GameLayout onBackToMenu={() => setCurrentView('landing')} />
                )}
            </div>
        </div>
    );
}
