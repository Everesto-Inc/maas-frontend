"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getClient, clearSession } from "@/lib/auth";
import VmCard from "@/components/VmCard";

interface Vm {
  ip: string; hostname?: string; cloud?: string;
  has_node_exporter: boolean; discovered_at?: string;
}

interface ClientInfo {
  slug: string; company_name: string; status: string;
  plan: string; full_name?: string; email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [client, setClient]   = useState<ClientInfo | null>(null);
  const [vms, setVms]         = useState<Vm[]>([]);
  const [loading, setLoading] = useState(true);
  const [grafanaLoading, setGrafanaLoading] = useState(false);

  useEffect(() => {
    const c = getClient();
    if (!c) { router.push("/login"); return; }
    setClient(c as ClientInfo);

    api.get<ClientInfo>("/clients/me").then(setClient).catch(() => {});
    api.get<Vm[]>("/clients/me/vms").then(setVms).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const openGrafana = async () => {
    setGrafanaLoading(true);
    try {
      const res = await api.get<{ url: string }>("/clients/me/grafana-url");
      window.open(res.url, "_blank");
    } catch {
      alert("Dashboard not ready yet. Make sure your agent is running.");
    } finally {
      setGrafanaLoading(false);
    }
  };

  const logout = () => { clearSession(); router.push("/login"); };

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="neuro p-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {client?.company_name || "Loading…"}
          </h1>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {client?.email} · Plan: {client?.plan}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/settings" className="neuro-btn px-4 py-2 text-xs font-medium"
                style={{ color: "var(--text-muted)" }}>Settings</Link>
          <button onClick={logout} className="neuro-btn px-4 py-2 text-xs font-medium"
                  style={{ color: "var(--text-muted)" }}>Sign out</button>
        </div>
      </div>

      {/* Status + metrics CTA */}
      <div className="neuro p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Agent status</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: client?.status === "active" ? "#4ade80" : "#f59e0b" }} />
              <p className="text-xs capitalize" style={{ color: "var(--text-muted)" }}>
                {client?.status || "—"}
              </p>
            </div>
          </div>
          <button onClick={openGrafana} disabled={grafanaLoading || client?.status !== "active"}
            className="neuro-btn-primary px-6 py-2 text-sm font-medium disabled:opacity-50">
            {grafanaLoading ? "Opening…" : "View metrics →"}
          </button>
        </div>

        {client?.status !== "active" && (
          <div className="neuro-inset px-4 py-3">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Agent not connected yet.{" "}
              <Link href="/onboard" style={{ color: "var(--accent)" }}>Complete setup →</Link>
            </p>
          </div>
        )}
      </div>

      {/* VM list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Your VMs ({vms.length})
          </h2>
          <Link href="/dashboard/vms" className="text-xs" style={{ color: "var(--accent)" }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--text-muted)" }}>Loading VMs…</p>
        ) : vms.length === 0 ? (
          <div className="neuro-inset p-6 text-center">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No VMs discovered yet. Make sure your agent is running.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {vms.slice(0, 4).map((vm) => <VmCard key={vm.ip} vm={vm} />)}
          </div>
        )}
      </div>
    </main>
  );
}
