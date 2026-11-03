"use client";

import { useEffect } from "react";

const visitorKey = "fodmap_tracker_visitor";
const sessionKey = "fodmap_tracker_session";

export function VisitorTracker() {
  useEffect(() => {
    try {
      let visitorId = localStorage.getItem(visitorKey);
      if (!visitorId) { visitorId = crypto.randomUUID(); localStorage.setItem(visitorKey, visitorId); }
      if (sessionStorage.getItem(sessionKey)) return;
      const sessionId = crypto.randomUUID();
      sessionStorage.setItem(sessionKey, sessionId);
      void fetch("/api/visits", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visitorId, sessionId }),
        keepalive: true,
      });
    } catch { /* Privacy settings or blocked storage must never block the app. */ }
  }, []);
  return null;
}
