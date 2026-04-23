"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { PiLinkDuotone, PiPlusDuotone } from "react-icons/pi";

// Discord logo as inline SVG to avoid adding a new icon library dep
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  type: string;
  active: boolean;
}

interface DiscordHook {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

const WEBHOOK_TYPES = [
  "ticket.created",
  "ticket.updated",
  "ticket.closed",
  "ticket.assigned",
  "comment.created",
];

export default function WebhooksPage() {
  const queryClient = useQueryClient();

  // ── Generic webhooks ──
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "webhooks"],
    queryFn: () => api<{ webhooks: Webhook[] }>("/api/v1/webhooks/all"),
  });
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    url: "",
    type: "ticket.created",
    active: true,
    secret: "",
  });
  const [status, setStatus] = useState("");

  const create = async () => {
    setStatus("Creating...");
    try {
      await api("/api/v1/webhook/create", { method: "POST", json: form });
      await queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] });
      setForm({ name: "", url: "", type: "ticket.created", active: true, secret: "" });
      setShowCreate(false);
      setStatus("");
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : "Failed.");
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    try {
      await api(`/api/v1/admin/webhook/${id}/delete`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "webhooks"] });
    } catch {}
  };

  // ── Discord webhooks ──
  const { data: discordData, isLoading: discordLoading } = useQuery({
    queryKey: ["admin", "discord"],
    queryFn: () => api<{ hooks: DiscordHook[] }>("/api/v1/discord/all"),
  });
  const [showDiscordCreate, setShowDiscordCreate] = useState(false);
  const [discordForm, setDiscordForm] = useState({ name: "", url: "", active: true });
  const [discordStatus, setDiscordStatus] = useState("");

  const createDiscord = async () => {
    setDiscordStatus("Creating...");
    try {
      await api("/api/v1/discord/create", { method: "POST", json: discordForm });
      await queryClient.invalidateQueries({ queryKey: ["admin", "discord"] });
      setDiscordForm({ name: "", url: "", active: true });
      setShowDiscordCreate(false);
      setDiscordStatus("");
    } catch (e: unknown) {
      setDiscordStatus(e instanceof Error ? e.message : "Failed.");
    }
  };

  const toggleDiscord = async (id: string, active: boolean) => {
    try {
      await api(`/api/v1/discord/${id}/toggle`, { method: "PATCH", json: { active } });
      await queryClient.invalidateQueries({ queryKey: ["admin", "discord"] });
    } catch {}
  };

  const deleteDiscord = async (id: string) => {
    if (!confirm("Delete this Discord webhook?")) return;
    try {
      await api(`/api/v1/discord/${id}/delete`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "discord"] });
    } catch {}
  };

  const webhooks = data?.webhooks ?? [];
  const discordHooks = discordData?.hooks ?? [];

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ── */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#09090b] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Admin · Webhooks
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Webhooks
            </h1>
            <p className="text-sm text-zinc-500">
              Outbound event hooks for issue lifecycle events.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="h-9 gap-1.5 rounded-full px-4 font-semibold bg-white text-black hover:bg-zinc-200"
          >
            <PiPlusDuotone className="h-3.5 w-3.5" />
            New webhook
          </Button>
        </div>
      </section>

      {/* ── Create generic webhook ── */}
      {showCreate && (
        <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
            <CardTitle className="text-white">Create webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="My webhook"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                  placeholder="https://example.com/webhook"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Event type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-[#09090b] px-3 text-sm text-white outline-none focus:ring-1 focus:ring-white/[0.15]"
                >
                  {WEBHOOK_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Secret <span className="normal-case text-zinc-600">(optional)</span>
                </label>
                <input
                  type="password"
                  value={form.secret}
                  onChange={(e) => setForm((f) => ({ ...f, secret: e.target.value }))}
                  placeholder="Signing secret"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.active}
                onClick={() => setForm((f) => ({ ...f, active: !f.active }))}
                className={`relative h-7 w-12 rounded-full transition-colors ${form.active ? "bg-violet-500" : "bg-white/10"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${form.active ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm text-zinc-400">Active</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <p className="text-sm text-zinc-500">{status}</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowCreate(false)} className="rounded-full text-zinc-400 hover:text-white">Cancel</Button>
                <Button size="sm" onClick={() => void create()} className="rounded-full bg-white text-black hover:bg-zinc-200">Create</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Generic webhook list ── */}
      <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
          <CardTitle className="text-white">All webhooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">Loading...</div>
          ) : webhooks.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">No webhooks configured.</div>
          ) : (
            webhooks.map((wh) => (
              <div key={wh.id} className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <PiLinkDuotone className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{wh.name}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${wh.active ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-white/[0.08] bg-white/[0.03] text-zinc-500"}`}>
                        {wh.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-zinc-500">{wh.url}</p>
                    <p className="text-xs text-zinc-600">{wh.type}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteWebhook(wh.id)}
                  className="shrink-0 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* ── Discord section ── */}
      <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DiscordIcon className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-white">Discord webhooks</CardTitle>
            </div>
            <button
              type="button"
              onClick={() => setShowDiscordCreate((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <PiPlusDuotone className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {showDiscordCreate && (
            <div className="mb-2 space-y-4 rounded-[24px] border border-indigo-500/20 bg-indigo-500/5 px-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Name</label>
                  <input
                    type="text"
                    value={discordForm.name}
                    onChange={(e) => setDiscordForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Support channel"
                    className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">Discord webhook URL</label>
                  <input
                    type="url"
                    value={discordForm.url}
                    onChange={(e) => setDiscordForm((f) => ({ ...f, url: e.target.value }))}
                    placeholder="https://discord.com/api/webhooks/…"
                    className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-indigo-500/40"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-500">{discordStatus}</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowDiscordCreate(false)} className="rounded-full text-zinc-400 hover:text-white">Cancel</Button>
                  <Button size="sm" onClick={() => void createDiscord()} className="rounded-full bg-indigo-600 text-white hover:bg-indigo-500">Add webhook</Button>
                </div>
              </div>
            </div>
          )}

          {discordLoading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">Loading...</div>
          ) : discordHooks.length === 0 && !showDiscordCreate ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              No Discord webhooks. New issues will post rich embeds to your Discord channel.
            </div>
          ) : (
            discordHooks.map((hook) => (
              <div key={hook.id} className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                    <DiscordIcon className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{hook.name}</p>
                      <button
                        type="button"
                        onClick={() => void toggleDiscord(hook.id, !hook.active)}
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors ${hook.active ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20" : "border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"}`}
                      >
                        {hook.active ? "Active" : "Inactive"}
                      </button>
                    </div>
                    <p className="font-mono text-xs text-zinc-500 truncate max-w-[320px]">{hook.url}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteDiscord(hook.id)}
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
