"use client";

import { ArrowRight, CircleDot, Plus, User } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTicketStats, useTickets } from "@/hooks/use-tickets";
import { useSession } from "@/lib/store";

export default function DashboardPage() {
  const { user } = useSession();
  const {
    open,
    completed,
    unassigned,
    isLoading: statsLoading,
  } = useTicketStats();
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets("open");

  const stats = [
    { name: "Open issues", value: open, tone: "text-white" },
    { name: "Completed", value: completed, tone: "text-zinc-400" },
    { name: "Unassigned", value: unassigned, tone: "text-zinc-500" },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#09090b] p-8 sm:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Good Morning
            <span className="text-zinc-500 font-normal">
              {user?.name ? `, ${user.name}` : ""}
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-400/90 leading-relaxed max-w-2xl">
            Here's what's happening with your support requests today.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Link href="/issues">
              <Button className="h-11 px-6 rounded-full bg-white text-black hover:bg-zinc-200 transition-colors gap-2 font-medium">
                View issues <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button
                variant="outline"
                className="h-11 px-6 rounded-full border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors gap-2 font-medium"
              >
                <User className="h-4 w-4" /> Profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="bg-[#09090b] border-white/5 shadow-none overflow-hidden group hover:border-white/10 transition-colors"
          >
            <CardHeader className="pb-2">
              <CardDescription className="uppercase tracking-[0.2em] font-semibold text-[10px] text-zinc-500">
                {stat.name}
              </CardDescription>
              <CardTitle
                className={`text-4xl font-semibold tracking-tight pt-1 ${stat.tone}`}
              >
                {statsLoading ? "..." : stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card className="rounded-2xl border-white/5 bg-[#09090b] shadow-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-white/5 bg-[#0a0a0c] px-6 py-5">
            <div>
              <CardTitle className="text-lg font-medium">
                Recent issues
              </CardTitle>
            </div>
            <Link href="/issues">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full hidden sm:flex hover:bg-white/5"
              >
                All queues
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {ticketsLoading ? (
              <div className="p-16 text-center text-sm text-zinc-500 font-medium">
                Loading...
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {ticketsData?.tickets?.length ? (
                  ticketsData.tickets.slice(0, 6).map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/issue/${ticket.id}`}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <p className="font-medium text-sm text-zinc-200 truncate pr-4">
                          {ticket.title}
                        </p>
                        <p className="text-xs text-zinc-500 flex items-center gap-2">
                          <span className="font-mono text-[10px] uppercase text-zinc-400 bg-white/5 px-1.5 py-0.5 rounded-sm">
                            {ticket.id}
                          </span>
                          <span>{ticket.assignedTo?.name ?? "Unassigned"}</span>
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="flex-shrink-0 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border-white/5 hover:bg-white/10"
                      >
                        <CircleDot className="h-3 w-3 text-zinc-500" />
                        {ticket.priority ?? "Normal"}
                      </Badge>
                    </Link>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-zinc-500 font-medium">
                    Yay! No active issues found
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-white/5 bg-[#09090b] shadow-none h-fit">
          <CardHeader className="border-b border-white/5 bg-[#0a0a0c] px-6 py-5">
            <CardTitle className="text-lg font-medium">Priorities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-6 text-sm font-medium">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-zinc-300 transition-colors hover:bg-white/5">
              Admin surface, roles, clients
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-zinc-300 transition-colors hover:bg-white/5">
              Portal flows & user tracking
            </div>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-zinc-300 transition-colors hover:bg-white/5">
              Notebook extensions
            </div>
            <Button className="mt-4 w-full gap-2 rounded-xl h-11 font-medium bg-white text-black hover:bg-zinc-200">
              <Plus className="h-4 w-4" />
              New feature flag
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
