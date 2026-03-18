"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getClient } from "@/lib/auth";
import CopyCommand from "@/components/CopyCommand";

export default function OnboardPage() {
  const router = useRouter();
  const [dockerCmd, setDockerCmd] = useState("");
  const [slug, setSlug]           = useState("");
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const generate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post<{ docker_command: string; slug: string }>("/onboard", {});
      setDockerCmd(res.docker_command);
      setSlug(res.slug);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate setup command");
    } finally {
      setLoading(false);
    }
  };

  const client = getClient();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="neuro p-10 max-w-lg w-full space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Connect your infrastructure
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Hi {client?.full_name || "there"}! Generate a Docker command and run it on any one VM in your cloud.
            Our agent will discover the rest automatically.
          </p>
        </div>

        {!dockerCmd ? (
          <div className="space-y-4">
            <div className="neuro-inset p-4 space-y-2 text-sm" style={{ color: "var(--text-muted)" }}>
              <p>✓ Run on <strong>one VM</strong> — it discovers all others</p>
              <p>✓ Works through NAT, firewalls, private subnets</p>
              <p>✓ No inbound ports required — agent connects outbound on 443</p>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button onClick={generate} disabled={loading}
              className="neuro-btn-primary w-full py-3 text-sm font-medium disabled:opacity-60">
              {loading ? "Generating…" : "Generate setup command"}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <CopyCommand command={dockerCmd} />

            <div className="neuro-inset p-4 text-sm space-y-1" style={{ color: "var(--text-muted)" }}>
              <p>1. Copy the command above</p>
              <p>2. Paste it on any VM in your cloud</p>
              <p>3. Watch your infrastructure come online →</p>
            </div>

            <button
              onClick={() => router.push(`/status/${slug}`)}
              className="neuro-btn-primary w-full py-3 text-sm font-medium"
            >
              Watch live setup progress →
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
