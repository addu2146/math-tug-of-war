import React from 'react';
import GameLayout from './components/GameLayout.jsx';
import LandscapePrompt from './components/LandscapePrompt.jsx';

export default function App() {
    return (
        <div className="game-wrapper" style={{ width: '100%', height: '100%' }}>
            <LandscapePrompt />
            <div className="game-container" style={{ width: '100%', height: '100%' }}>
                <GameLayout />
            </div>
        </div>
    );
}
