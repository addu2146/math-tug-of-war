/**
 * Countdown — 3-2-1 countdown with light theme.
 */

import React, { useState, useEffect } from 'react';

export default function Countdown({ onComplete }) {
    const [count, setCount] = useState(3);

    useEffect(() => {
        if (count <= 0) {
            onComplete();
            return;
        }
        const timer = setTimeout(() => setCount(count - 1), 800);
        return () => clearTimeout(timer);
    }, [count, onComplete]);

    if (count <= 0) return null;

    return (
        <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div
                key={count}
                className="animate-countdown-pop"
                style={{
                    fontSize: '8rem',
                    fontWeight: 900,
                    color: 'var(--blue)',
                    textShadow: '0 4px 20px rgba(29, 155, 240, 0.3)',
                }}
            >
                {count}
            </div>
        </div>
    );
}
