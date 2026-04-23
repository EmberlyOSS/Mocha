"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import {
  PiCheckCircleDuotone,
  PiPaperPlaneTiltDuotone,
  PiWarningDuotone,
} from "react-icons/pi";

type ServiceType = "gmail" | "microsoft" | "other";

interface EmailConfig {
  active: boolean;
  host: string;
  port: string;
  reply: string;
  user: string;
}

interface EmailResponse {
  active: boolean;
  email?: EmailConfig;
}

export default function SmtpPage() {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType>("other");
  const [form, setForm] = useState({
    host: "",
    port: "587",
    reply: "",
    username: "",
    password: "",
    clientId: "",
    clientSecret: "",
    redirectUri: "",
    tenantId: "",
    active: true,
  });
  const [status, setStatus] = useState<{ msg: string; ok?: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testStatus, setTestStatus] = useState<{ msg: string; ok?: boolean } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api<EmailResponse>("/api/v1/config/email");
        if (data.email) {
          setConfig(data.email);
          setForm((f) => ({
            ...f,
            host: data.email!.host ?? "",
            port: data.email!.port ?? "587",
            reply: data.email!.reply ?? "",
            username: data.email!.user ?? "",
          }));
        }
      } catch {}
      setLoading(false);
    };
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await api<{ success: boolean; authorizeUrl?: string }>(
        "/api/v1/config/email",
        { method: "PUT", json: { ...form, serviceType } },
      );
      if (res.authorizeUrl) {
        window.location.href = res.authorizeUrl;
        return;
      }
      setStatus({ msg: "Settings saved.", ok: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed.";
      setStatus({ msg, ok: false });
    }
    setSaving(false);
  };

  const remove = async () => {
    if (!confirm("Remove email configuration?")) return;
    try {
      await api("/api/v1/config/email", { method: "DELETE" });
      setConfig(null);
      setStatus({ msg: "Configuration removed.", ok: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed.";
      setStatus({ msg, ok: false });
    }
  };

  const sendTest = async () => {
    if (!testTo) return;
    setTesting(true);
    setTestStatus(null);
    try {
      await api("/api/v1/config/email/test", {
        method: "POST",
        json: { to: testTo },
      });
      setTestStatus({ msg: `Test email sent to ${testTo}.`, ok: true });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to send.";
      setTestStatus({ msg, ok: false });
    }
    setTesting(false);
  };

  function Field({
    label,
    fieldKey,
    type = "text",
    placeholder = "",
  }: {
    label: string;
    fieldKey: keyof typeof form;
    type?: string;
    placeholder?: string;
  }) {
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          {label}
        </label>
        <input
          type={type}
          value={form[fieldKey] as string}
          onChange={(e) =>
            setForm((f) => ({ ...f, [fieldKey]: e.target.value }))
          }
          placeholder={placeholder}
          className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ── */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#09090b] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Admin · Email
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              SMTP / Email provider
            </h1>
            <p className="text-sm text-zinc-500">
              Configure the outbound email provider used for notifications and
              password resets.
            </p>
          </div>
          {config?.active ? (
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 w-fit">
              <PiCheckCircleDuotone className="h-3.5 w-3.5" />
              Connected
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-500 w-fit">
              <PiWarningDuotone className="h-3.5 w-3.5" />
              Not configured
            </div>
          )}
        </div>
      </section>

      {loading ? (
        <div className="rounded-[28px] border border-dashed border-white/10 px-4 py-16 text-center text-sm text-zinc-600">
          Loading...
        </div>
      ) : (
        <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
            <CardTitle className="text-white">Provider configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Service type selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Service type
              </label>
              <div className="flex gap-2">
                {(["other", "gmail", "microsoft"] as ServiceType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setServiceType(t)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                      serviceType === t
                        ? "bg-white text-black"
                        : "border border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {t === "other" ? "SMTP" : t === "gmail" ? "Gmail" : "Microsoft"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Reply-to address"
                fieldKey="reply"
                type="email"
                placeholder="noreply@example.com"
              />
              <Field
                label="Send-as username / address"
                fieldKey="username"
                placeholder="user@example.com"
              />

              {serviceType === "other" && (
                <>
                  <Field
                    label="SMTP host"
                    fieldKey="host"
                    placeholder="smtp.example.com"
                  />
                  <Field label="Port" fieldKey="port" placeholder="587" />
                  <Field
                    label="Password"
                    fieldKey="password"
                    type="password"
                    placeholder="••••••••"
                  />
                </>
              )}

              {(serviceType === "gmail" || serviceType === "microsoft") && (
                <>
                  <Field
                    label="Client ID"
                    fieldKey="clientId"
                    placeholder="your-client-id"
                  />
                  <Field
                    label="Client secret"
                    fieldKey="clientSecret"
                    type="password"
                    placeholder="••••••••"
                  />
                  <Field
                    label="Redirect URI"
                    fieldKey="redirectUri"
                    placeholder="https://yourdomain.com/api/v1/config/email/oauth/gmail"
                  />
                  {serviceType === "microsoft" && (
                    <Field
                      label="Tenant ID"
                      fieldKey="tenantId"
                      placeholder="your-tenant-id"
                    />
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {status && (
                  <p
                    className={`text-sm ${status.ok ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {status.msg}
                  </p>
                )}
                {config && (
                  <button
                    type="button"
                    onClick={() => void remove()}
                    className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    Remove config
                  </button>
                )}
              </div>
              <Button
                disabled={saving}
                onClick={() => void save()}
                className="rounded-full bg-white text-black hover:bg-zinc-200"
              >
                {serviceType === "gmail" ? "Save & authorise" : "Save settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Test email ── */}
      {config?.active && (
        <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <PiPaperPlaneTiltDuotone className="h-4 w-4 text-violet-400" />
              <CardTitle className="text-white">Send a test email</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="mb-4 text-sm text-zinc-500">
              Send a test message to verify your provider is delivering emails correctly.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="email"
                value={testTo}
                onChange={(e) => setTestTo(e.target.value)}
                placeholder="test@example.com"
                className="h-10 w-full rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15] sm:max-w-xs"
              />
              <Button
                disabled={testing || !testTo}
                onClick={() => void sendTest()}
                className="rounded-full bg-white text-black hover:bg-zinc-200 shrink-0"
              >
                {testing ? "Sending..." : "Send test"}
              </Button>
              {testStatus && (
                <p className={`text-sm ${testStatus.ok ? "text-emerald-400" : "text-red-400"}`}>
                  {testStatus.msg}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
