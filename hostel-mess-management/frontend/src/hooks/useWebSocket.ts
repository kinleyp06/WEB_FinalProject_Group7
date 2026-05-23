import { useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

type WSMessage =
  | { type: "MEAL_UPDATED"; meal: Record<string, unknown> }
  | { type: "NEW_ANNOUNCEMENT"; announcement: { title: string } }
  | { type: "NEW_SPECIAL_MEAL"; specialMeal: Record<string, unknown> }
  | { type: "POLL_UPDATED"; pollId: number };

interface UseWebSocketOptions {
  /** Called when POLL_UPDATED is received — use to refresh poll data */
  onPollUpdated?: (pollId: number) => void;
  /** Called when NEW_SPECIAL_MEAL is received */
  onNewSpecialMeal?: (data: Record<string, unknown>) => void;
  /** Called when MEAL_UPDATED is received */
  onMealUpdated?: (data: Record<string, unknown>) => void;
}

/**
 * useWebSocket
 * Connects to the backend WebSocket server, auto-reconnects on disconnect,
 * and handles all 4 event types defined in the project:
 *   MEAL_UPDATED | NEW_ANNOUNCEMENT | NEW_SPECIAL_MEAL | POLL_UPDATED
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);

  const { onPollUpdated, onNewSpecialMeal, onMealUpdated } = options;

  const connect = useCallback(() => {
    if (!isMounted.current) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!wsUrl) {
      console.warn("[WebSocket] NEXT_PUBLIC_WS_URL is not set. Skipping connection.");
      return;
    }

    // Close any existing connection before reconnecting
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[WebSocket] Connected");
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg: WSMessage = JSON.parse(event.data as string);

        switch (msg.type) {
          case "MEAL_UPDATED":
            toast("🔔 Meal plan has been updated!", {
              duration: 4000,
              style: { background: "#1a2e1a", color: "#a5d6a7", border: "1px solid #2d5a2d" },
            });
            onMealUpdated?.(msg.meal);
            break;

          case "NEW_ANNOUNCEMENT":
            toast(`📢 ${msg.announcement.title}`, {
              duration: 5000,
              style: { background: "#1a2e1a", color: "#a5d6a7", border: "1px solid #2d5a2d" },
            });
            break;

          case "NEW_SPECIAL_MEAL":
            toast("🍽️ A new special meal poll is live! Check polls.", {
              duration: 5000,
              style: { background: "#1a2e1a", color: "#a5d6a7", border: "1px solid #2d5a2d" },
            });
            onNewSpecialMeal?.(msg.specialMeal);
            break;

          case "POLL_UPDATED":
            onPollUpdated?.(msg.pollId);
            break;

          default:
            // Unknown message type — safely ignore
            break;
        }
      } catch (err) {
        // Malformed JSON from server — don't crash
        console.warn("[WebSocket] Failed to parse message:", err);
      }
    };

    ws.onclose = () => {
      if (process.env.NODE_ENV === "development") {
        console.log("[WebSocket] Disconnected. Reconnecting in 3s…");
      }
      if (isMounted.current) {
        reconnectTimer.current = setTimeout(connect, 3000);
      }
    };

    ws.onerror = (err) => {
      console.warn("[WebSocket] Error:", err);
      ws.close(); // triggers onclose → reconnect
    };
  }, [onMealUpdated, onNewSpecialMeal, onPollUpdated]);

  useEffect(() => {
    isMounted.current = true;
    connect();

    return () => {
      isMounted.current = false;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);
}

export default useWebSocket;