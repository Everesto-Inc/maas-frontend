interface Vm {
  ip: string;
  hostname?: string;
  cloud?: string;
  has_node_exporter: boolean;
  discovered_at?: string;
}

const CLOUD_ICONS: Record<string, string> = {
  aws: "AWS", ibm: "IBM", oracle: "OCI", unknown: "Cloud",
};

export default function VmCard({ vm }: { vm: Vm }) {
  return (
    <div className="neuro p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {vm.hostname || vm.ip}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>{vm.ip}</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full neuro-inset"
              style={{ color: "var(--text-muted)" }}>
          {CLOUD_ICONS[vm.cloud || "unknown"]}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: vm.has_node_exporter ? "#4ade80" : "#f87171" }}
        />
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          {vm.has_node_exporter ? "Metrics active" : "Installing metrics agent…"}
        </p>
      </div>
    </div>
  );
}
