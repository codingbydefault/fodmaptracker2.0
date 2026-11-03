"use client";

import { useEffect } from "react";

export function ErrorReporter({ error, eventType = "client_error" }: { error: Error & { digest?: string }; eventType?: "client_error" | "route_error" }) {
  useEffect(() => {
    const errorCode = error.digest || error.name || "Error";
    void fetch("/api/monitoring/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType, path: window.location.pathname, errorCode }),
      keepalive: true,
    });
  }, [error, eventType]);

  return null;
}
