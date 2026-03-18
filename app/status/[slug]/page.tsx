import StatusStream from "@/components/StatusStream";

export default async function StatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="neuro p-10 max-w-lg w-full space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            Setting up your monitoring
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Live progress — this takes about 2 minutes.
          </p>
        </div>

        <StatusStream slug={slug} />
      </div>
    </main>
  );
}
