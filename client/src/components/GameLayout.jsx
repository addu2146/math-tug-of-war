/**
 * GameLayout — Root orchestrator with music integration.
 * Shows setup wizard → countdown → 3-panel game → victory.
 *
 * Music starts on game start, plays SFX on correct/incorrect answers.
 * Same-screen multi-touch: both teams interact on the same device.
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import GameHeader from './GameHeader.jsx';
import SetupWizard from './SetupWizard.jsx';
import PlayerPanel from './PlayerPanel.jsx';
import CenterPanel from './CenterPanel.jsx';
import Countdown from './Countdown.jsx';
import VictoryModal from './VictoryModal.jsx';
import PhaserGame from '../game/PhaserGame.jsx';
import { useWebSocket } from '../hooks/useWebSocket.js';
import { useGameState } from '../hooks/useGameState.js';
import { gameMusic } from '../audio/GameMusic.js';

export default function GameLayout({ onBackToMenu }) {
    const phaserRef = useRef(null);
    const { state, handleServerMessage, clearAnswerResult, resetState } = useGameState();
    const { sendMessage, isConnected } = useWebSocket(handleServerMessage);
    const [showCountdown, setShowCountdown] = useState(false);
    const [gameConfig, setGameConfig] = useState(null);

    // Handle setup wizard completion — start countdown
    const handleStartGame = useCallback((config) => {
        // Initialize audio on user gesture (required by browsers)
        gameMusic.init();
        setGameConfig(config);
        setShowCountdown(true);
    }, []);

    // Load and play the setup music the second they enter GameLayout
    useEffect(() => {
        if (state.phase === 'setup') {
            gameMusic.startSetupMusic();
        }
    }, [state.phase]);

    // After countdown, start the game via WebSocket and switch to gameplay music
    const handleCountdownComplete = useCallback(() => {
        setShowCountdown(false);
        sendMessage('SETUP_GAME', { payload: gameConfig });
        
        // Stops Beethoven, starts urgent synth background music
        gameMusic.start();
    }, [sendMessage, gameConfig]);

    // Handle answer submission from a player panel
    const handleSubmitAnswer = useCallback((side, answer) => {
        sendMessage('ANSWER_SUBMITTED', { side, answer });
    }, [sendMessage]);

    // Play SFX when answer results come in
    useEffect(() => {
        if (state.answerResults.left === 'correct' || state.answerResults.right === 'correct') {
            gameMusic.playCorrect();
        }
        if (state.answerResults.left === 'incorrect' || state.answerResults.right === 'incorrect') {
            gameMusic.playIncorrect();
        }
    }, [state.answerResults.left, state.answerResults.right]);

    // Stop music on game over
    useEffect(() => {
        if (state.phase === 'gameOver') {
            gameMusic.stop();
        }
    }, [state.phase]);

    // Handle play again
    const handlePlayAgain = useCallback(() => {
        resetState();
        setGameConfig(null);
    }, [resetState]);

    // Handle team-specific rage quit (forfeits the match)
    const handleTeamRageQuit = useCallback((side) => {
        sendMessage('RAGE_QUIT', { side });
    }, [sendMessage]);

    // Handle full exit to menu
    const handleExitToMenu = useCallback(() => {
        gameMusic.stop();
        resetState();
        setGameConfig(null);
        if (onBackToMenu) onBackToMenu();
    }, [resetState, onBackToMenu]);

    // Cleanup music on unmount
    useEffect(() => {
        return () => { gameMusic.destroy(); };
    }, []);

    // Show setup wizard
    if (state.phase === 'setup' && !showCountdown) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <GameHeader onBack={onBackToMenu} />
                {!isConnected && (
                    <div style={{
                        background: 'var(--red)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Warning"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        Connecting to server...
                    </div>
                )}
                <SetupWizard onStartGame={handleStartGame} />
            </div>
        );
    }

    // Show countdown
    if (showCountdown) {
        return (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <GameHeader onBack={handleExitToMenu} />
                <Countdown onComplete={handleCountdownComplete} />
            </div>
        );
    }

    // Main gameplay view
    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Absolute Background Phaser Game */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 0,
                pointerEvents: 'none',
            }}>
                <PhaserGame ref={phaserRef} />
            </div>

            {/* Foreground UI Layer */}
            <div style={{
                position: 'relative',
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                pointerEvents: 'none', // pass through to panels
            }}>
                <div style={{ pointerEvents: 'auto' }}>
                    <GameHeader onBack={handleExitToMenu} />
                </div>

                {/* 3-Panel Game Area */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    overflow: 'hidden',
                    alignItems: 'stretch',
                    minHeight: 0,
                }}>
                    {/* Left Player Panel (Blue) */}
                    <div style={{ pointerEvents: 'auto', display: 'flex', flex: 1, maxWidth: '320px' }}>
                        <PlayerPanel
                            side="left"
                            problem={state.problems.left}
                            score={state.players.left.score}
                            streak={state.players.left.streak}
                            teamName={state.teamNames.left}
                            answerResult={state.answerResults.left}
                            onSubmitAnswer={handleSubmitAnswer}
                            onClearResult={() => clearAnswerResult('left')}
                            onRageQuit={handleTeamRageQuit}
                            disabled={state.phase !== 'playing'}
                        />
                    </div>

                    {/* Center Panel (Scores + Timer) */}
                    <CenterPanel
                        leftScore={state.players.left.score}
                        rightScore={state.players.right.score}
                        leftTeamName={state.teamNames.left}
                        rightTeamName={state.teamNames.right}
                        timeRemaining={state.timeRemaining}
                    />

                    {/* Right Player Panel (Red) */}
                    <div style={{ pointerEvents: 'auto', display: 'flex', flex: 1, maxWidth: '320px' }}>
                        <PlayerPanel
                            side="right"
                            problem={state.problems.right}
                            score={state.players.right.score}
                            streak={state.players.right.streak}
                            teamName={state.teamNames.right}
                            answerResult={state.answerResults.right}
                            onSubmitAnswer={handleSubmitAnswer}
                            onClearResult={() => clearAnswerResult('right')}
                            onRageQuit={handleTeamRageQuit}
                            disabled={state.phase !== 'playing'}
                        />
                    </div>
                </div>
            </div>

            {/* Victory Modal */}
            {state.phase === 'gameOver' && (
                <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
                    <VictoryModal
                        winner={state.winner}
                        players={state.players}
                        teamNames={state.teamNames}
                        onPlayAgain={handlePlayAgain}
                        onExit={handleExitToMenu}
                    />
                </div>
            )}
        </div>
    );
}
