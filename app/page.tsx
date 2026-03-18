import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="neuro p-12 max-w-md w-full text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Everesto
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Full infrastructure monitoring for all your cloud VMs —
            one Docker command, zero configuration.
          </p>
        </div>

        <div className="space-y-3">
          <Link href="/signup" className="neuro-btn-primary block w-full py-3 px-6 text-center font-medium text-sm">
            Start monitoring for free
          </Link>
          <Link href="/login" className="neuro-btn block w-full py-3 px-6 text-center font-medium text-sm"
                style={{ color: "var(--text-primary)" }}>
            Sign in
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-2">
          {[
            ["1 command", "to connect"],
            ["All VMs", "auto-discovered"],
            ["Real-time", "Grafana metrics"],
          ].map(([title, sub]) => (
            <div key={title} className="neuro-inset p-3 text-center">
              <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>{title}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
