"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Github,
  Loader2,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";
import { setUser, useSession, useUser } from "@/lib/store";

type ResourceCard = {
  title: string;
  description: string;
  href: string;
  icon: typeof Github;
  external?: boolean;
  tone: string;
};

const resources: ResourceCard[] = [
  {
    title: "Source code",
    description: "See how Mocha is wired, extended, and deployed.",
    href: "https://github.com/EmberlyOSS/Mocha",
    icon: Github,
    external: true,
    tone: "from-sky-500/20 via-sky-500/10 to-transparent",
  },
  {
    title: "Documentation",
    description: "Read the setup guide, auth flow, and deployment notes.",
    href: "/documents",
    icon: BookOpenText,
    tone: "from-violet-500/20 via-violet-500/10 to-transparent",
  },
  {
    title: "Community",
    description: "Join the Discord for questions, feedback, and ideas.",
    href: "https://discord.gg/36spBmzZVB",
    icon: MessagesSquare,
    external: true,
    tone: "from-emerald-500/20 via-emerald-500/10 to-transparent",
  },
];

const checklist = [
  "Review the source and deployment layout.",
  "Skim the docs so you know the core flows.",
  "Jump into the dashboard and start triaging.",
];

export default function OnboardingPage() {
  const router = useRouter();
  const user = useUser();
  const { loading } = useSession();
  const [completing, setCompleting] = useState(false);
  const [status, setStatus] = useState("");

  const firstName = useMemo(() => {
    if (!user?.name) return "there";
    return user.name.split(" ")[0];
  }, [user?.name]);

  const completeOnboarding = async () => {
    if (!user?.id) {
      setStatus("Waiting for your session to load.");
      return;
    }

    setCompleting(true);
    setStatus("");

    try {
      await api(`/api/v1/auth/user/${user.id}/first-login`, {
        method: "POST",
      });

      setUser({ ...user, firstLogin: false });
      router.replace("/");
      router.refresh();
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Failed to finish setup.",
      );
    } finally {
      setCompleting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] border border-white/5 bg-[#050507] p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.2),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.08),transparent_35%)]" />
        <div className="relative z-10 flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading onboarding...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[32px] border border-white/5 bg-[#050507] p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.24),transparent_30%),radial-gradient(circle_at_top_right,rgba(34,197,94,0.07),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_25%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0d]/90 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.45)] sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.04),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.12),transparent_35%)]" />

          <div className="relative z-10 flex flex-col gap-8">
            <div className="flex items-center justify-between gap-4">
              <BrandMark size={44} />
              <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-violet-200">
                First login
              </div>
            </div>

            <div className="max-w-2xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-400">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                Welcome back, {firstName}
              </div>

              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Your workspace is ready.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Use this quick start screen to learn the ecosystem, inspect the
                codebase, and finish setup. Then we’ll drop you straight into
                the queue.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {resources.map(
                ({ title, description, href, icon: Icon, external, tone }) => (
                  <Link
                    key={title}
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${tone} opacity-60 transition-opacity group-hover:opacity-90`}
                    />
                    <div className="relative z-10 flex h-full flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <ArrowRight className="h-4 w-4 -translate-x-1 text-zinc-500 opacity-0 transition group-hover:translate-x-0 group-hover:text-white group-hover:opacity-100" />
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-white">
                          {title}
                        </p>
                        <p className="text-sm leading-relaxed text-zinc-400">
                          {description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ),
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <Card className="rounded-[26px] border-white/10 bg-white/[0.03] shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    What happens next
                  </div>

                  <ul className="mt-4 space-y-3">
                    {checklist.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 text-sm text-zinc-400"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="rounded-[26px] border-white/10 bg-white/[0.03] shadow-none">
                <CardContent className="flex h-full flex-col justify-between gap-5 p-5">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">
                      Finish setup
                    </p>
                    <p className="text-sm leading-relaxed text-zinc-400">
                      Mark the first-login flow complete and head to the
                      dashboard.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {status ? (
                      <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                        {status}
                      </p>
                    ) : (
                      <p className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-zinc-400">
                        You only need to do this once.
                      </p>
                    )}

                    <Button
                      onClick={() => void completeOnboarding()}
                      disabled={completing}
                      className="h-11 w-full rounded-full bg-white text-black hover:bg-zinc-200"
                    >
                      {completing ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Completing...
                        </>
                      ) : (
                        <>
                          Go to dashboard
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="bg-white/10" />

            <p className="text-xs uppercase tracking-[0.26em] text-zinc-600">
              Built for fast triage, quick context, and fewer clicks.
            </p>
          </div>
        </section>

        <aside className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0d]/90 p-6 shadow-[0_24px_100px_rgba(0,0,0,0.45)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.12),transparent_34%)]" />

          <div className="relative z-10 flex h-full flex-col justify-between gap-10">
            <div className="space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-500">
                Setup guide
              </div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Start with the three touchpoints that matter.
              </h2>
              <p className="text-sm leading-relaxed text-zinc-400">
                A clean onboarding step works best when it points people toward
                the places they’ll actually use on day one.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Connect the codebase and docs.",
                "Skim the issue composer and queue layout.",
                "Drop into the dashboard once you’re done.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4"
                >
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-[11px] font-semibold text-violet-200">
                    0{index + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-400">{item}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5">
              <p className="text-sm font-semibold text-white">One last thing</p>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                Once you finish this screen, the onboarding flag is cleared and
                you’ll land on the main dashboard.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
