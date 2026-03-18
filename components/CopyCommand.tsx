"use client";

import { useState } from "react";

export default function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="neuro-inset p-5 space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        Docker command
      </p>
      <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all leading-relaxed"
           style={{ color: "var(--text-primary)" }}>
        {command}
      </pre>
      <button onClick={copy} className="neuro-btn px-4 py-2 text-xs font-medium"
              style={{ color: "var(--accent)" }}>
        {copied ? "Copied!" : "Copy command"}
      </button>
    </div>
  );
}
