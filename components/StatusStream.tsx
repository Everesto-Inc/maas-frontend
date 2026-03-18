"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface StatusEvent {
  event: string;
  message: string;
  detail?: string;
}

const EVENT_LABELS: Record<string, string> = {
  connecting:   "Agent connecting",
  scanning:     "Scanning VPC",
  installing:   "Installing Node Exporter",
  provisioning: "Setting up dashboard",
  active:       "Done!",
  error:        "Error",
};

export default function StatusStream({ slug }: { slug: string }) {
  const router = useRouter();
  const [events, setEvents] = useState<StatusEvent[]>([]);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    const url = `${process.env.NEXT_PUBLIC_API_URL}/onboard/${slug}/stream`;
    let active = true;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (res) => {
        if (!res.ok || !res.body) {
          setError("Failed to connect to status stream.");
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (active) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            try {
              const ev: StatusEvent = JSON.parse(line.slice(5).trim());
              setEvents((prev) => [...prev, ev]);
              if (ev.event === "active") {
                setDone(true);
                active = false;
                setTimeout(() => router.push("/dashboard"), 2000);
              }
              if (ev.event === "error") {
                setError(ev.detail || ev.message);
                active = false;
              }
            } catch { /* skip malformed SSE line */ }
          }
        }
        reader.cancel();
      })
      .catch(() => setError("Connection to status stream lost."));

    return () => { active = false; };
  }, [slug, router]);

  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <div key={i} className="neuro-inset px-4 py-3 flex items-start gap-3">
          <span className="text-lg leading-none">
            {ev.event === "active" ? "✓" : ev.event === "error" ? "✗" : "◎"}
          </span>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {EVENT_LABELS[ev.event] || ev.event}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{ev.message}</p>
          </div>
        </div>
      ))}

      {!done && !error && events.length === 0 && (
        <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
          Waiting for agent to connect…
        </p>
      )}

      {done && (
        <p className="text-sm text-center font-medium" style={{ color: "var(--accent)" }}>
          Redirecting to your dashboard…
        </p>
      )}

      {error && (
        <div className="neuro-inset px-4 py-3">
          <p className="text-sm text-red-500 font-medium">Setup failed</p>
          <p className="text-xs text-red-400 mt-1">{error}</p>
        </div>
      )}
    </div>
  );
}
