"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getClient } from "@/lib/auth";
import VmCard from "@/components/VmCard";

interface Vm {
  ip: string; hostname?: string; cloud?: string;
  has_node_exporter: boolean; discovered_at?: string;
}

export default function VmsPage() {
  const router = useRouter();
  const [vms, setVms]         = useState<Vm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getClient()) { router.push("/login"); return; }
    api.get<Vm[]>("/clients/me/vms").then(setVms).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  return (
    <main className="min-h-screen px-4 py-10 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="neuro-btn px-4 py-2 text-xs font-medium"
              style={{ color: "var(--text-muted)" }}>← Dashboard</Link>
        <h1 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
          VM Inventory ({vms.length})
        </h1>
      </div>

      {loading ? (
        <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>Loading…</p>
      ) : vms.length === 0 ? (
        <div className="neuro-inset p-8 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>No VMs discovered yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vms.map((vm) => <VmCard key={vm.ip} vm={vm} />)}
        </div>
      )}
    </main>
  );
}
