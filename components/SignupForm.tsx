"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

type AccountType = "individual" | "company";
type Step = "type" | "form" | "done";
type FormState = {
  full_name: string; email: string; password: string; phone: string;
  country: string; timezone: string; company_name: string; job_title: string;
  company_reg_no: string; industry: string; company_size: string;
  website: string; billing_address: string; vat_number: string;
};

function Field({ label, k, type = "text", placeholder = "", required = true, form, onChange }: {
  label: string; k: keyof FormState; type?: string; placeholder?: string; required?: boolean;
  form: FormState; onChange: (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{label}{!required && " (optional)"}</label>
      <div className="neuro-inset px-4 py-3">
        <input type={type} placeholder={placeholder} value={form[k]}
          onChange={onChange(k)} required={required}
          className="w-full bg-transparent outline-none text-sm" style={{ color: "var(--text-primary)" }} />
      </div>
    </div>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>("type");
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  const [form, setForm] = useState<FormState>({
    full_name: "", email: "", password: "", phone: "", country: "", timezone: "",
    company_name: "", job_title: "", company_reg_no: "", industry: "",
    company_size: "", website: "", billing_address: "", vat_number: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        account_type: accountType,
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        country: form.country,
        timezone: form.timezone,
      };
      if (accountType === "company") {
        body.company_name    = form.company_name;
        body.job_title       = form.job_title || undefined;
        body.company_reg_no  = form.company_reg_no || undefined;
        body.industry        = form.industry || undefined;
        body.company_size    = form.company_size || undefined;
        body.website         = form.website || undefined;
        body.billing_address = form.billing_address || undefined;
        body.vat_number      = form.vat_number || undefined;
      }

      const res = await api.post<{ access_token: string; client: object }>("/auth/signup", body);
      saveSession(res.access_token, res.client as never);
      setStep("done");
      setTimeout(() => router.push("/onboard"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === "type") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>Create account</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>How are you signing up?</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(["individual", "company"] as AccountType[]).map((t) => (
            <button
              key={t}
              onClick={() => { setAccountType(t); setStep("form"); }}
              className="neuro-btn py-6 flex flex-col items-center gap-2"
            >
              <span className="text-2xl">{t === "individual" ? "👤" : "🏢"}</span>
              <span className="text-sm font-medium capitalize" style={{ color: "var(--text-primary)" }}>{t}</span>
            </button>
          ))}
        </div>
        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)" }} className="font-medium">Sign in</Link>
        </p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="text-center space-y-4 py-6">
        <p className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Account created!</p>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Redirecting to onboarding…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <button type="button" onClick={() => setStep("type")}
          className="neuro-btn px-3 py-1 text-xs" style={{ color: "var(--text-muted)" }}>← Back</button>
        <h2 className="text-xl font-semibold capitalize" style={{ color: "var(--text-primary)" }}>
          {accountType} account
        </h2>
      </div>

      <Field label="Full name" k="full_name" placeholder="Jane Doe" form={form} onChange={set} />
      <Field label="Email" k="email" type="email" placeholder="jane@company.com" form={form} onChange={set} />
      <Field label="Password" k="password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol" form={form} onChange={set} />
      <Field label="Phone" k="phone" placeholder="+1234567890" required={false} form={form} onChange={set} />
      <Field label="Country (ISO code)" k="country" placeholder="US" form={form} onChange={set} />
      <Field label="Timezone" k="timezone" placeholder="America/New_York" form={form} onChange={set} />

      {accountType === "company" && (
        <>
          <hr style={{ borderColor: "var(--shadow-dark)", opacity: 0.4 }} />
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Company details</p>
          <Field label="Company name" k="company_name" placeholder="Acme Corp" form={form} onChange={set} />
          <Field label="Job title" k="job_title" placeholder="CTO" required={false} form={form} onChange={set} />
          <Field label="Registration number" k="company_reg_no" placeholder="12345678" required={false} form={form} onChange={set} />
          <Field label="Industry" k="industry" placeholder="Technology" required={false} form={form} onChange={set} />
          <div className="space-y-2">
            <label className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Company size (optional)</label>
            <div className="neuro-inset px-4 py-3">
              <select value={form.company_size} onChange={set("company_size")}
                className="w-full bg-transparent outline-none text-sm" style={{ color: "var(--text-primary)" }}>
                <option value="">Select…</option>
                {["1-10","11-50","51-200","201-1000","1000+"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <Field label="Website" k="website" placeholder="https://acme.com" required={false} form={form} onChange={set} />
          <Field label="Billing address" k="billing_address" placeholder="123 Main St…" required={false} form={form} onChange={set} />
          <Field label="VAT number" k="vat_number" placeholder="GB123456789" required={false} form={form} onChange={set} />
        </>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button type="submit" disabled={loading}
        className="neuro-btn-primary w-full py-3 text-sm font-medium disabled:opacity-60">
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
