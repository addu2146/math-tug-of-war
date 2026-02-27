/**
 * PhaserGame — React mount/destroy wrapper.
 * Phaser canvas is NOT transparent anymore — sits inside the CenterPanel card.
 */

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './config.js';
import { EventBus, GAME_EVENTS } from './EventBus.js';

const CONTAINER_ID = 'phaser-game-container';

const PhaserGame = forwardRef(function PhaserGame(props, ref) {
    const gameRef = useRef(null);

    useImperativeHandle(ref, () => ({
        get game() { return gameRef.current; },
        get scene() { return gameRef.current?.scene?.getScene('TugScene'); },
    }));

    useEffect(() => {
        const config = createGameConfig(CONTAINER_ID);
        const game = new Phaser.Game(config);
        gameRef.current = game;

        return () => {
            if (gameRef.current) {
                gameRef.current.destroy(true);
                gameRef.current = null;
            }
        };
    }, []);

    return (
        <div
            id={CONTAINER_ID}
            style={{
                width: '100%',
                height: '100%',
            }}
        />
    );
});

export default PhaserGame;
