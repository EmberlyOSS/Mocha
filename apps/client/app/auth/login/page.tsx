"use client";

import { setCookie } from "cookies-next";
import {
  ArrowRight,
  CircleDot,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { api } from "@/lib/api";

const features = [
  {
    icon: Zap,
    title: "Real-time updates",
    desc: "Live ticket status as your team works.",
  },
  {
    icon: Shield,
    title: "Role-based access",
    desc: "Admins, engineers and clients — all in one place.",
  },
  {
    icon: CircleDot,
    title: "Smart queue",
    desc: "Prioritise, assign and close faster than ever.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [oidcUrl, setOidcUrl] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOidcUrl = async () => {
      try {
        const data = await api<{ success?: boolean; url?: string }>(
          "/api/v1/auth/check",
          { auth: false },
        );
        if (data.success && data.url) setOidcUrl(data.url);
      } catch {
        // OIDC is optional — silently ignore if not configured
      }
    };
    void loadOidcUrl();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error")) {
      setError(
        "SSO login failed — no matching account found. Ask an admin to provision access first.",
      );
    }
  }, []);

  const handleLogin = async () => {
    setSubmitting(true);
    setError("");
    try {
      const result = await api<{
        user?: { external_user?: boolean; firstLogin?: boolean };
        token?: string;
      }>("/api/v1/auth/login", {
        method: "POST",
        auth: false,
        json: { email, password },
      });

      if (!result.user || !result.token) {
        setError("Invalid credentials. Double-check and try again.");
        return;
      }

      setCookie("session", result.token);
      if (result.user.external_user) {
        router.replace("/portal");
        return;
      }
      router.replace(result.user.firstLogin ? "/onboarding" : "/");
      router.refresh();
    } catch {
      setError("Login failed. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Fixed overlay so it escapes the sidebar padding wrapper entirely */
    <div className="fixed inset-0 z-50 flex bg-[#050507]">
      {/* ─── LEFT PANEL ─── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[58%] flex-col overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-[#0d0a1a] to-[#050507]" />

        {/* Glow blobs */}
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-violet-600/25 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-700/20 blur-[100px]" />
        <div className="absolute top-1/2 left-1/3 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[80px]" />

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-1 flex-col gap-16 p-12 pt-10 xl:p-16 xl:pt-12">
          {/* Logo */}
          <BrandMark />

          {/* Hero text */}
          <div className="mt-10 space-y-8 xl:mt-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 tracking-widest uppercase">
                Support command center
              </div>
              <h2 className="text-5xl xl:text-6xl font-bold tracking-tight text-white leading-[1.1]">
                Keep every issue
                <br />
                <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  moving.
                </span>
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-sm">
                Triage, track, and resolve customer issues without losing
                context between teams.
              </p>
            </div>

            {/* Feature list */}
            <div className="space-y-4">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon className="h-4.5 w-4.5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="text-sm text-zinc-500">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12 sm:px-12">
        {/* Subtle top-right glow */}
        <div className="pointer-events-none absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="relative z-10 w-full max-w-[400px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <BrandMark size={36} />
          </div>

          {/* Heading */}
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-white">
                Welcome back
              </h1>
              <p className="text-zinc-500">
                Sign in to your workspace to continue.
              </p>
            </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="text-xs font-semibold uppercase tracking-widest text-zinc-500"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-13 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] pl-11 pr-4 py-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-violet-500/15"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="text-xs font-semibold uppercase tracking-widest text-zinc-500"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void handleLogin();
                  }}
                  className="h-13 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] pl-11 pr-12 py-3.5 text-sm text-white placeholder-zinc-600 outline-none transition-all focus:border-violet-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-violet-500/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 transition hover:text-zinc-400"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Forgot password */}
            <div className="flex justify-end -mt-2">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-zinc-600 transition hover:text-violet-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign in button */}
            <button
              id="login-submit"
              type="button"
              onClick={() => void handleLogin()}
              disabled={submitting}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-sm font-semibold text-white shadow-xl shadow-violet-500/30 transition-all hover:shadow-violet-500/50 hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{submitting ? "Signing in…" : "Sign in"}</span>
              {!submitting && (
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              )}
            </button>

            {/* OIDC */}
            {oidcUrl && (
              <button
                id="login-oidc"
                type="button"
                onClick={() => router.push(oidcUrl)}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm font-medium text-zinc-400 transition hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white"
              >
                Sign in with SSO
              </button>
            )}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs text-zinc-700">
            Having trouble?{" "}
            <span className="text-zinc-600">Contact your administrator.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
