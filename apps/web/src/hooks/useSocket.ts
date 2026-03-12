"use client";

import { useEffect, useRef } from "react";
import { useNotificationStore } from "@/stores/notification";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || `ws://${typeof window !== "undefined" ? window.location.host : "localhost"}`;

export function useSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const addNotification = useNotificationStore((s) => s.addNotification);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}/notifications/ws?token=${token}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addNotification(data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      // Reconnect logic could go here
    };

    return () => {
      ws.close();
    };
  }, [addNotification]);

  return wsRef;
}
