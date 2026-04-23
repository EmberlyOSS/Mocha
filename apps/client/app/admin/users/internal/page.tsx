"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, formatDate } from "@/lib/api";
import { PiPlusDuotone, PiShieldCheckDuotone } from "react-icons/pi";

interface InternalUser {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => api<{ users: InternalUser[] }>("/api/v1/users/all"),
  });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    admin: false,
  });
  const [createStatus, setCreateStatus] = useState("");
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPass, setNewPass] = useState("");

  const create = async () => {
    setCreateStatus("Creating...");
    try {
      await api("/api/v1/user/new", { method: "POST", json: form });
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      setForm({ name: "", email: "", password: "", admin: false });
      setShowCreate(false);
      setCreateStatus("");
    } catch (e: unknown) {
      setCreateStatus(e instanceof Error ? e.message : "Failed.");
    }
  };

  const resetPassword = async (id: string) => {
    if (!newPass) return;
    try {
      await api("/api/v1/user/reset-password", {
        method: "PUT",
        json: { id, password: newPass },
      });
      setResetId(null);
      setNewPass("");
    } catch {}
  };

  const users = data?.users ?? [];

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* ── Header ── */}
      <section className="rounded-[28px] border border-white/[0.08] bg-[#09090b] px-6 py-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
              Admin · Users
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Internal users
            </h1>
            <p className="text-sm text-zinc-500">
              {isLoading
                ? "Loading..."
                : `${users.length} user${users.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate((v) => !v)}
            className="h-9 gap-1.5 rounded-full px-4 font-semibold bg-white text-black hover:bg-zinc-200"
          >
            <PiPlusDuotone className="h-3.5 w-3.5" />
            New user
          </Button>
        </div>
      </section>

      {/* ── Create form ── */}
      {showCreate && (
        <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
          <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
            <CardTitle className="text-white">Create user</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
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
                  placeholder="Jane Smith"
                  className="w-full h-10 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  placeholder="jane@example.com"
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
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.admin}
                onClick={() => setForm((f) => ({ ...f, admin: !f.admin }))}
                className={`relative h-7 w-12 rounded-full transition-colors ${
                  form.admin ? "bg-violet-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                    form.admin ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-zinc-400">Administrator</span>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] pt-4">
              <p className="text-sm text-zinc-500">{createStatus}</p>
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

      {/* ── User list ── */}
      <Card className="overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
          <CardTitle className="text-white">All users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {isLoading ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              Loading...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/10 px-4 py-10 text-center text-sm text-zinc-500">
              No users yet.
            </div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">
                    {u.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{u.name}</p>
                      {u.isAdmin && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
                          <PiShieldCheckDuotone className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      {u.email} · Created {formatDate(u.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {resetId === u.id ? (
                    <>
                      <input
                        type="password"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        placeholder="New password"
                        className="h-9 w-40 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder-zinc-600 outline-none focus:ring-1 focus:ring-white/[0.15]"
                      />
                      <Button
                        size="sm"
                        onClick={() => void resetPassword(u.id)}
                        className="rounded-full bg-white text-black hover:bg-zinc-200 text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setResetId(null);
                          setNewPass("");
                        }}
                        className="rounded-full text-zinc-400 text-xs"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setResetId(u.id)}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                      Reset password
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
