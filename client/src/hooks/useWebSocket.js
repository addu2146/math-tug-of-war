/**
 * useWebSocket — Single WebSocket connection for same-screen multi-touch play.
 * Both players are handled through the same connection.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { WS_URL } from '../utils/constants.js';

export function useWebSocket(onMessage) {
    const wsRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const onMessageRef = useRef(onMessage);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        let ws;
        let reconnectTimeout;

        function connect() {
            ws = new WebSocket(WS_URL);
            wsRef.current = ws;

            ws.onopen = () => {
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (onMessageRef.current) onMessageRef.current(data);
                } catch (err) {
                    console.error('[WS] Parse error:', err);
                }
            };

            ws.onclose = () => {
                setIsConnected(false);
                wsRef.current = null;
                reconnectTimeout = setTimeout(connect, 2000);
            };

            ws.onerror = () => setIsConnected(false);
        }

        connect();
        return () => {
            clearTimeout(reconnectTimeout);
            if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
        };
    }, []);

    const sendMessage = useCallback((type, payload = {}) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type, ...payload }));
        }
    }, []);

    return { sendMessage, isConnected };
}
