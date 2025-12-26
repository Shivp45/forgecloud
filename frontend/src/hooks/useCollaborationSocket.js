import { useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";

export function useCollaborationSocket({ roomId, userId, url }) {
  const wsRef = useRef(null);
  const heartbeatRef = useRef(null);

  const connect = useCallback(() => {
    if (wsRef.current) return wsRef.current;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", roomId, userId }));
      toast.success(`Joined collaboration room: ${roomId}`);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "error") {
          toast.error(data.message);
        }
      } catch {
        toast.error("Malformed WebSocket message received");
      }
    };

    ws.onerror = () => {
      toast.error("Collaboration socket error");
    };

    ws.onclose = () => {
      toast.warn("Disconnected from collaboration server");
    };

    // Heartbeat ping for stability
    heartbeatRef.current = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "ping" }));
      }
    }, 25000);

    return ws;
  }, [roomId, userId, url]);

  const sendMessage = useCallback((payload) => {
    const ws = connect();
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      toast.error("Socket not connected");
      return;
    }
    ws.send(JSON.stringify(payload));
  }, [connect]);

  useEffect(() => {
    const ws = connect();
    return () => {
      clearInterval(heartbeatRef.current);
      ws?.close();
    };
  }, [connect]);

  return { sendMessage, ws: wsRef.current };
}
