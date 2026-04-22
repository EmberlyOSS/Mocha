"use client";

import {
  PiArrowRightDuotone,
} from "react-icons/pi";
import {
  GoIssueOpened,
  GoIssueClosed,
  GoDotFill,
} from "react-icons/go";
import Link from "next/link";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTicketStats, useTickets } from "@/hooks/use-tickets";
import { useSession } from "@/lib/store";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { user } = useSession();
  const {
    open,
    completed,
    unassigned,
    isLoading: statsLoading,
  } = useTicketStats();
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets("open");

  const greeting = useMemo(() => getGreeting(), []);

  const stats = [
    {
      name: "Open",
      value: open,
      tone: "text-white",
      icon: GoIssueOpened,
      iconColor: "text-emerald-400",
      dot: "bg-emerald-500",
    },
    {
      name: "Completed",
      value: completed,
      tone: "text-zinc-300",
      icon: GoIssueClosed,
      iconColor: "text-violet-400",
      dot: "bg-violet-500",
    },
    {
      name: "Unassigned",
      value: unassigned,
      tone: "text-zinc-500",
      icon: GoDotFill,
      iconColor: "text-zinc-600",
      dot: "bg-zinc-600",
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 pb-10">
        {/* ─── Hero ─── */}
        <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#09090b] p-8 sm:p-12 shadow-2xl">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative z-10 space-y-6 max-w-3xl">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
              {greeting}
              <span className="text-zinc-500 font-normal">
                {user?.name ? `, ${user.name}` : ""}
              </span>
            </h2>

            <p className="text-base sm:text-lg text-zinc-400/90 leading-relaxed max-w-2xl">
              Here&apos;s what&apos;s happening with your support requests today.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/issues">
                    <Button className="h-11 px-6 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors gap-2 font-medium">
                      View issues
                      <PiArrowRightDuotone className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Browse all open issues</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/new">
                    <Button
                      variant="outline"
                      className="h-11 px-6 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors gap-2 font-medium"
                    >
                      <Plus className="h-4 w-4" strokeWidth={2.4} />
                      New issue
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Create a new support ticket</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </section>

        {/* ─── Stats ─── */}
        <section className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card
              key={stat.name}
              className="bg-[#09090b] border-white/5 shadow-none overflow-hidden group hover:border-white/10 transition-all"
            >
              <CardHeader className="pb-2 flex-row items-center justify-between space-y-0">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
                  {stat.name}
                </span>
                <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
              </CardHeader>
              <CardContent className="pb-4">
                {statsLoading ? (
                  <Skeleton className="h-10 w-16 rounded-md" />
                ) : (
                  <p className={`text-4xl font-semibold tracking-tight ${stat.tone}`}>
                    {stat.value ?? 0}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <Separator className="bg-white/5" />

        {/* ─── Main grid ─── */}
        <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {/* Recent issues */}
          <Card className="rounded-2xl border-white/5 bg-[#09090b] shadow-none overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-white/5 bg-[#0a0a0c] px-6 py-5">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <GoIssueOpened className="h-4 w-4 text-emerald-400" />
                Recent issues
              </CardTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/issues">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 rounded-full hidden sm:flex hover:bg-white/5 text-zinc-400 hover:text-white"
                    >
                      All queues
                      <PiArrowRightDuotone className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>View all issue queues</TooltipContent>
              </Tooltip>
            </CardHeader>
            <CardContent className="p-0">
              {ticketsLoading ? (
                <div className="divide-y divide-white/5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3.5 w-3/4 rounded" />
                        <Skeleton className="h-2.5 w-1/2 rounded" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {ticketsData?.tickets?.length ? (
                    ticketsData.tickets.slice(0, 6).map((ticket) => (
                      <Tooltip key={ticket.id}>
                        <TooltipTrigger asChild>
                          <Link
                            href={`/issue/${ticket.id}`}
                            className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.025] group"
                          >
                            <div className="space-y-1.5 min-w-0 flex-1 flex items-center gap-3">
                              <GoIssueOpened className="h-4 w-4 text-emerald-400 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-sm text-zinc-200 truncate pr-4 group-hover:text-white transition-colors">
                                  {ticket.title}
                                </p>
                                <p className="text-xs text-zinc-600 flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] uppercase text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded-sm">
                                    {ticket.id}
                                  </span>
                                  <span>{ticket.assignedTo?.name ?? "Unassigned"}</span>
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className="flex-shrink-0 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                            >
                              <GoDotFill className="h-2.5 w-2.5 text-zinc-500" />
                              {ticket.priority ?? "Normal"}
                            </Badge>
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          View issue #{ticket.id}
                        </TooltipContent>
                      </Tooltip>
                    ))
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-12 text-center">
                      <GoIssueClosed className="h-8 w-8 text-zinc-700" />
                      <p className="text-sm text-zinc-600 font-medium">
                        No active issues — great work!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priorities */}
          <Card className="rounded-2xl border-white/5 bg-[#09090b] shadow-none h-fit">
            <CardHeader className="border-b border-white/5 bg-[#0a0a0c] px-6 py-5">
              <CardTitle className="text-base font-semibold">
                Priorities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 text-sm font-medium">
              {[
                "Admin surface, roles, clients",
                "Portal flows & user tracking",
                "Notebook extensions",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-zinc-300 transition-colors hover:bg-white/5 cursor-default"
                >
                  <GoDotFill className="h-2.5 w-2.5 text-violet-400 shrink-0" />
                  {item}
                </div>
              ))}
              <Separator className="!my-4 bg-white/5" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button className="w-full gap-2 rounded-xl h-11 font-medium bg-white text-black hover:bg-zinc-200">
                    <Plus className="h-4 w-4" strokeWidth={2.4} />
                    New feature flag
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle a local feature flag</TooltipContent>
              </Tooltip>
            </CardContent>
          </Card>
        </section>
      </div>
    </TooltipProvider>
  );
}
