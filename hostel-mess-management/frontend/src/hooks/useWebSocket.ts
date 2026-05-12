'use client';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function useWebSocket() {
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const connect = () => {
            const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL!);
            wsRef.current = ws;

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'MEAL_UPDATED') {
                        toast('Meal plan has been updated!', { icon: '🔔' });
                    } else if (data.type === 'NEW_ANNOUNCEMENT') {
                        toast(`New announcement: ${data.announcement.title}`, { duration: 5000 });
                    }
                } catch { }
            };

            ws.onclose = () => setTimeout(connect, 3000);
        };

        connect();
        return () => { if (wsRef.current) wsRef.current.close(); };
    }, []);
}