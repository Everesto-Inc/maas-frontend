"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getClient, clearSession } from "@/lib/auth";

interface ClientInfo {
  slug: string; company_name: string; account_type: string;
  email: string; plan: string; status: string;
  full_name?: string; country?: string; timezone?: string;
}

interface LaptopCmd {
  docker_cmd: string;
  macos_cmd: string;
  laptop_dashboard_url: string | null;
  token_expires_at: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [client, setClient]         = useState<ClientInfo | null>(null);
  const [laptopCmd, setLaptopCmd]   = useState<LaptopCmd | null>(null);
  const [cmdLoading, setCmdLoading] = useState(false);
  const [os, setOs]                 = useState<"linux" | "macos">("linux");
  const [copied, setCopied]         = useState(false);
  const [pwMsg, setPwMsg]           = useState("");
  const [pwLoading, setPwLoading]   = useState(false);
  const [grafanaCreds, setGrafanaCreds] = useState<{ url: string; user: string; pass: string } | null>(null);
  const [grafanaCredsLoading, setGrafanaCredsLoading] = useState(false);
  const [grafanaPwForm, setGrafanaPwForm] = useState({ new_password: "", confirm: "" });
  const [grafanaPwMsg, setGrafanaPwMsg]   = useState("");
  const [grafanaPwLoading, setGrafanaPwLoading] = useState(false);

  useEffect(() => {
    if (!getClient()) { router.push("/login"); return; }
    api.get<ClientInfo>("/clients/me").then(setClient).catch(() => {});
    // Auto-detect OS
    if (navigator.userAgent.includes("Mac")) setOs("macos");
  }, [router]);

  const generateLaptopCmd = async () => {
    setCmdLoading(true);
    try {
      const data = await api.get<LaptopCmd>("/clients/me/laptop-cmd");
      setLaptopCmd(data);
    } catch {
      // silent
    } finally {
      setCmdLoading(false);
    }
  };

  const activeCmd = laptopCmd ? (os === "macos" ? laptopCmd.macos_cmd : laptopCmd.docker_cmd) : "";

  const copyCmd = async () => {
    if (!activeCmd) return;
    await navigator.clipboard.writeText(activeCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true); setPwMsg("");
    try {
      await api.post("/auth/reset-password", { email: client?.email });
      setPwMsg("Password reset email sent.");
    } catch {
      setPwMsg("Failed to send reset email.");
    } finally {
      setPwLoading(false);
    }
  };

  const logout = () => { clearSession(); router.push("/login"); };

  const openLaptopDashboard = async () => {
    if (!laptopCmd?.laptop_dashboard_url) return;
    setGrafanaCredsLoading(true);
    try {
      const res = await api.get<{ url: string; grafana_user: string; grafana_pass: string }>("/clients/me/grafana-url");
      const fullUrl = `${grafanaBase}${laptopCmd.laptop_dashboard_url}`;
      setGrafanaCreds({ url: fullUrl, user: res.grafana_user, pass: res.grafana_pass });
    } catch {
      // silent — dashboard link remains visible
    } finally {
      setGrafanaCredsLoading(false);
    }
  };

  const changeGrafanaPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (grafanaPwForm.new_password !== grafanaPwForm.confirm) {
      setGrafanaPwMsg("Passwords do not match.");
      return;
    }
    setGrafanaPwLoading(true); setGrafanaPwMsg("");
    try {
      await api.put("/clients/me/grafana-password", { new_password: grafanaPwForm.new_password });
      setGrafanaPwMsg("Grafana password updated.");
      setGrafanaPwForm({ new_password: "", confirm: "" });
    } catch (err) {
      setGrafanaPwMsg(err instanceof Error ? err.message : "Failed to update password.");
    } finally {
      setGrafanaPwLoading(false);
    }
  };

  const expiresLabel = laptopCmd
    ? new Date(laptopCmd.token_expires_at).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
      })
    : null;

  const grafanaBase = process.env.NEXT_PUBLIC_GRAFANA_URL ?? "http://localhost:3001";

  return (
    <main className="min-h-screen px-4 py-10 max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="neuro-btn px-4 py-2 text-xs font-medium"
              style={{ color: "var(--text-muted)" }}>← Dashboard</Link>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Settings</h1>
      </div>

      {/* Profile */}
      <div className="neuro p-6 space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Profile</h2>
        {client && (
          <div className="space-y-2 text-sm">
            {[
              ["Name", client.full_name],
              ["Email", client.email],
              ["Account type", client.account_type],
              ["Country", client.country],
              ["Timezone", client.timezone],
            ].map(([label, value]) => (
              <div key={label} className="neuro-inset px-4 py-3 flex justify-between">
                <span style={{ color: "var(--text-muted)" }}>{label}</span>
                <span style={{ color: "var(--text-primary)" }}>{value || "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Laptop Monitoring ── */}
      <div className="neuro p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Laptop Monitoring
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Free on all plans. Run once — metrics appear instantly in your dashboard.
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ background: "var(--accent)", color: "#000", opacity: 0.85 }}>
            Free
          </span>
        </div>

        {!laptopCmd ? (
          <button onClick={generateLaptopCmd} disabled={cmdLoading}
            className="neuro-btn w-full py-3 text-sm font-medium disabled:opacity-60"
            style={{ color: "var(--text-primary)" }}>
            {cmdLoading ? "Setting up dashboard…" : "Get laptop command"}
          </button>
        ) : (
          <div className="space-y-3">

            {/* OS tabs */}
            <div className="flex gap-2">
              {(["linux", "macos"] as const).map((tab) => (
                <button key={tab} onClick={() => setOs(tab)}
                  className="neuro-btn px-4 py-1.5 text-xs font-medium capitalize"
                  style={{
                    color: os === tab ? "var(--accent)" : "var(--text-muted)",
                    borderBottom: os === tab ? "1px solid var(--accent)" : "none",
                  }}>
                  {tab === "macos" ? "macOS" : "Linux"}
                </button>
              ))}
            </div>

            {/* macOS pre-step */}
            {os === "macos" && (
              <div className="neuro-inset px-4 py-3 space-y-1">
                <p className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  Step 1 — install Node Exporter on your Mac:
                </p>
                <pre className="text-xs mt-1" style={{ color: "var(--accent)", fontFamily: "monospace" }}>
                  brew install node_exporter{"\n"}node_exporter &
                </pre>
              </div>
            )}

            {/* Command box */}
            <div className="neuro-inset p-3 rounded-lg relative">
              <p className="text-xs mb-2 font-medium"
                 style={{ color: "var(--text-muted)" }}>
                {os === "macos" ? "Step 2 — run this command:" : "Run this command on your laptop:"}
              </p>
              <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all pr-10"
                   style={{ color: "var(--accent)", fontFamily: "monospace" }}>
                {activeCmd}
              </pre>
              <button onClick={copyCmd}
                className="absolute top-3 right-3 neuro-btn px-2 py-1 text-xs font-medium"
                style={{ color: copied ? "var(--accent)" : "var(--text-muted)" }}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Command valid until{" "}
              <strong style={{ color: "var(--text-primary)" }}>{expiresLabel}</strong>.
            </p>

            {/* Dashboard link — show credentials first, then open */}
            {laptopCmd.laptop_dashboard_url ? (
              <button
                onClick={openLaptopDashboard}
                disabled={grafanaCredsLoading}
                className="neuro-btn w-full py-3 text-sm font-medium disabled:opacity-60"
                style={{ color: "var(--accent)" }}>
                {grafanaCredsLoading ? "Loading credentials…" : "Open My Laptop Dashboard →"}
              </button>
            ) : (
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Dashboard provisioning… try refreshing in a moment.
              </p>
            )}

            <button onClick={generateLaptopCmd} disabled={cmdLoading}
              className="neuro-btn w-full py-2 text-xs"
              style={{ color: "var(--text-muted)" }}>
              {cmdLoading ? "Regenerating…" : "Regenerate command"}
            </button>
          </div>
        )}
      </div>

      {/* Subscription */}
      <div className="neuro p-6 space-y-3">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Subscription</h2>
        <div className="neuro-inset px-4 py-3 flex justify-between text-sm">
          <span style={{ color: "var(--text-muted)" }}>Plan</span>
          <span className="font-medium capitalize" style={{ color: "var(--accent)" }}>{client?.plan}</span>
        </div>
        {client?.plan === "free" && (
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Free plan: up to 3 VMs, 7-day retention. Upgrade coming soon.
          </p>
        )}
      </div>

      {/* Security */}
      <div className="neuro p-6 space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Security</h2>

        {/* Portal password reset */}
        <div className="space-y-2">
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Portal password</p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            We&apos;ll send a reset link to your email.
          </p>
          {pwMsg && <p className="text-xs" style={{ color: "var(--accent)" }}>{pwMsg}</p>}
          <button onClick={changePassword} disabled={pwLoading}
            className="neuro-btn px-5 py-2 text-sm font-medium disabled:opacity-60"
            style={{ color: "var(--text-primary)" }}>
            {pwLoading ? "Sending…" : "Send password reset email"}
          </button>
        </div>

        {/* Grafana dashboard password */}
        {laptopCmd && (
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Grafana dashboard password
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Change the password you use to log in to Grafana.
            </p>
            <form onSubmit={changeGrafanaPassword} className="space-y-2">
              <input
                type="password"
                placeholder="New password"
                value={grafanaPwForm.new_password}
                onChange={(e) => setGrafanaPwForm((f) => ({ ...f, new_password: e.target.value }))}
                className="neuro-inset w-full px-3 py-2 text-sm bg-transparent outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={grafanaPwForm.confirm}
                onChange={(e) => setGrafanaPwForm((f) => ({ ...f, confirm: e.target.value }))}
                className="neuro-inset w-full px-3 py-2 text-sm bg-transparent outline-none"
                style={{ color: "var(--text-primary)" }}
              />
              {grafanaPwMsg && (
                <p className="text-xs" style={{ color: grafanaPwMsg.includes("updated") ? "var(--accent)" : "#f87171" }}>
                  {grafanaPwMsg}
                </p>
              )}
              <button type="submit" disabled={grafanaPwLoading || !grafanaPwForm.new_password}
                className="neuro-btn px-5 py-2 text-sm font-medium disabled:opacity-60"
                style={{ color: "var(--text-primary)" }}>
                {grafanaPwLoading ? "Updating…" : "Update Grafana password"}
              </button>
            </form>
          </div>
        )}
      </div>

      <button onClick={logout} className="neuro-btn w-full py-3 text-sm font-medium"
              style={{ color: "var(--text-muted)" }}>
        Sign out
      </button>

      {/* Grafana credentials modal */}
      {grafanaCreds && (
        <div className="fixed inset-0 flex items-center justify-center z-50"
          style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="neuro p-8 max-w-sm w-full space-y-5 mx-4">
            <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
              Grafana login credentials
            </h3>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Log in with these credentials to see only your laptop&apos;s metrics.
            </p>
            {[{ label: "Username", value: grafanaCreds.user }, { label: "Password", value: grafanaCreds.pass }].map(({ label, value }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}</p>
                <div className="neuro-inset px-3 py-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>{value}</span>
                  <button onClick={() => navigator.clipboard.writeText(value)}
                    className="text-xs px-2 py-1 neuro-btn" style={{ color: "var(--accent)" }}>
                    Copy
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => { window.open(grafanaCreds.url, "_blank"); setGrafanaCreds(null); }}
              className="neuro-btn-primary w-full py-2 text-sm font-medium">
              Open My Laptop Dashboard →
            </button>
            <button onClick={() => setGrafanaCreds(null)}
              className="w-full text-xs text-center" style={{ color: "var(--text-muted)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
