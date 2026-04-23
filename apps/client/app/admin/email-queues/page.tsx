"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { PiEnvelopeDuotone, PiPlusDuotone } from "react-icons/pi";

type ServiceType = "gmail" | "other";

interface EmailQueue {
  id: string;
  name: string;
  serviceType: string;
  active: boolean;
  username: string;
  hostname: string;
  tls: boolean;
  clientId: string | null;
}

export default function EmailQueuesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "email-queues"],
    queryFn: () => api<{ queues: EmailQueue[] }>("/api/v1/email-queues/all"),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [serviceType, setServiceType] = useState<ServiceType>("other");
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    hostname: "",
    tls: true,
    clientId: "",
    clientSecret: "",
    redirectUri: "",
  });
  const [status, setStatus] = useState("");

  const create = async () => {
    setStatus("Creating...");
    try {
      const res = await api<{ success: boolean; authorizeUrl?: string }>(
        "/api/v1/email-queue/create",
        { method: "POST", json: { ...form, serviceType } },
      );
      if (res.authorizeUrl) {
        window.location.href = res.authorizeUrl;
        return;
      }
      await queryClient.invalidateQueries({ queryKey: ["admin", "email-queues"] });
      setForm({
        name: "",
        username: "",
        password: "",
        hostname: "",
        tls: true,
        clientId: "",
        clientSecret: "",
        redirectUri: "",
      });
      setShowCreate(false);
      setStatus("");
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : "Failed.");
    }
  };

  const deleteQueue = async (id: string) => {
    if (!confirm("Delete this email queue?")) return;
    try {
      await api("/api/v1/email-queue/delete", {
        method: "DELETE",
        json: { id },
      });
      await queryClient.invalidateQueries({ queryKey: ["admin", "email-queues"] });
    } catch {}
  };

  const queues = data?.queues ?? [];

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ── */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#09090b] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Admin · Email
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Email queues
            </h1>
            <p className="text-sm text-zinc-500">
              Inbound mailboxes polled via IMAP to automatically create tickets.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="h-9 gap-1.5 rounded-full px-4 font-semibold bg-white text-black hover:bg-zinc-200"
          >
            <PiPlusDuotone className="h-3.5 w-3.5" />
            New queue
          </Button>
        </div>
      </section>

      {/* ── Create form ── */}
      {showCreate && (
        <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
            <CardTitle className="text-white">Create email queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {/* Service type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Service type
              </label>
              <div className="flex gap-2">
                {(["other", "gmail"] as ServiceType[]).map((t) => (
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
                    {t === "other" ? "IMAP / SMTP" : "Gmail OAuth"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Queue name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Support inbox"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Username / address
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  placeholder="support@example.com"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>

              {serviceType === "other" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Hostname
                    </label>
                    <input
                      type="text"
                      value={form.hostname}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, hostname: e.target.value }))
                      }
                      placeholder="imap.example.com"
                      className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Password
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                    />
                  </div>
                </>
              )}

              {serviceType === "gmail" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={form.clientId}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, clientId: e.target.value }))
                      }
                      placeholder="your-client-id"
                      className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Client secret
                    </label>
                    <input
                      type="password"
                      value={form.clientSecret}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, clientSecret: e.target.value }))
                      }
                      placeholder="••••••••"
                      className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Redirect URI
                    </label>
                    <input
                      type="text"
                      value={form.redirectUri}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, redirectUri: e.target.value }))
                      }
                      placeholder="https://yourdomain.com/api/v1/email-queue/oauth/gmail"
                      className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                    />
                  </div>
                </>
              )}
            </div>

            {serviceType === "other" && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.tls}
                  onClick={() => setForm((f) => ({ ...f, tls: !f.tls }))}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    form.tls ? "bg-violet-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      form.tls ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-zinc-400">TLS</span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <p className="text-sm text-zinc-500">{status}</p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreate(false)}
                  className="rounded-full text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => void create()}
                  className="rounded-full bg-white text-black hover:bg-zinc-200"
                >
                  {serviceType === "gmail" ? "Save & authorise" : "Create"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Queue list ── */}
      <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
          <CardTitle className="text-white">All queues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              Loading...
            </div>
          ) : queues.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              No email queues configured.
            </div>
          ) : (
            queues.map((q) => (
              <div
                key={q.id}
                className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                    <PiEnvelopeDuotone className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{q.name}</p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                          q.active
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-white/[0.08] bg-white/[0.03] text-zinc-500"
                        }`}
                      >
                        {q.active ? "Active" : "Inactive"}
                      </span>
                      <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500">
                        {q.serviceType}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {q.username}
                      {q.hostname ? ` · ${q.hostname}` : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteQueue(q.id)}
                  className="shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
