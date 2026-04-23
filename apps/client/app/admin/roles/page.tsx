"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { PiPlusDuotone, PiShieldCheckDuotone } from "react-icons/pi";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isDefault: boolean;
}

const ALL_PERMISSIONS: { category: string; perms: string[] }[] = [
  {
    category: "Issues",
    perms: [
      "issue::create",
      "issue::read",
      "issue::write",
      "issue::update",
      "issue::delete",
      "issue::assign",
      "issue::transfer",
      "issue::comment",
    ],
  },
  {
    category: "Users",
    perms: [
      "user::create",
      "user::read",
      "user::update",
      "user::delete",
    ],
  },
  {
    category: "Roles",
    perms: [
      "role::create",
      "role::read",
      "role::update",
      "role::delete",
    ],
  },
  {
    category: "Clients",
    perms: [
      "client::create",
      "client::read",
      "client::update",
      "client::delete",
    ],
  },
  {
    category: "Webhooks",
    perms: [
      "webhook::create",
      "webhook::read",
      "webhook::update",
      "webhook::delete",
    ],
  },
  {
    category: "Documents",
    perms: [
      "document::create",
      "document::read",
      "document::update",
      "document::delete",
    ],
  },
  {
    category: "System",
    perms: ["settings::view", "settings::manage", "time_entry::create", "time_entry::read"],
  },
];

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: () =>
      api<{ roles: Role[] }>("/api/v1/roles/all"),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[],
    isDefault: false,
  });
  const [status, setStatus] = useState("");

  const togglePerm = (p: string) =>
    setForm((f) => ({
      ...f,
      permissions: f.permissions.includes(p)
        ? f.permissions.filter((x) => x !== p)
        : [...f.permissions, p],
    }));

  const create = async () => {
    setStatus("Creating...");
    try {
      await api("/api/v1/role/create", { method: "POST", json: form });
      await queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
      setForm({ name: "", description: "", permissions: [], isDefault: false });
      setShowCreate(false);
      setStatus("");
    } catch (e: unknown) {
      setStatus(e instanceof Error ? e.message : "Failed.");
    }
  };

  const deleteRole = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    try {
      await api(`/api/v1/role/${id}/delete`, { method: "DELETE" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    } catch {}
  };

  const roles = data?.roles ?? [];

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ── */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#09090b] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Admin · Roles
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Roles
            </h1>
            <p className="text-sm text-zinc-500">
              {isLoading
                ? "Loading..."
                : `${roles.length} role${roles.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="h-9 gap-1.5 rounded-full px-4 font-semibold bg-white text-black hover:bg-zinc-200"
          >
            <PiPlusDuotone className="h-3.5 w-3.5" />
            New role
          </Button>
        </div>
      </section>

      {/* ── Create form ── */}
      {showCreate && (
        <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
            <CardTitle className="text-white">Create role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Support agent"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Can view and reply to tickets"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Permissions
              </label>
              {ALL_PERMISSIONS.map(({ category, perms }) => (
                <div key={category} className="space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                    {category}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {perms.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePerm(p)}
                        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                          form.permissions.includes(p)
                            ? "border border-violet-500/30 bg-violet-500/20 text-violet-300"
                            : "border border-white/[0.08] bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.isDefault}
                onClick={() =>
                  setForm((f) => ({ ...f, isDefault: !f.isDefault }))
                }
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  form.isDefault ? "bg-violet-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    form.isDefault ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-zinc-400">Default role</span>
            </div>

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
                  Create
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Roles list ── */}
      <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
          <CardTitle className="text-white">All roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              Loading...
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              No roles yet. Create one above.
            </div>
          ) : (
            roles.map((role) => (
              <div
                key={role.id}
                className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 md:flex-row md:items-start md:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                    <PiShieldCheckDuotone className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {role.name}
                      </p>
                      {role.isDefault && (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {role.description || "No description"}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {role.permissions.slice(0, 8).map((p) => (
                        <span
                          key={p}
                          className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500"
                        >
                          {p}
                        </span>
                      ))}
                      {role.permissions.length > 8 && (
                        <span className="rounded-full border border-white/[0.06] bg-white/[0.03] px-2 py-0.5 text-[10px] text-zinc-500">
                          +{role.permissions.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void deleteRole(role.id)}
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
