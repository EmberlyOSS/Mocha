'use client';

import Link from 'next/link';
import { ArrowRight, CircleDot, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTicketStats, useTickets } from '@/hooks/use-tickets';
import { useSession } from '@/lib/store';

export default function DashboardPage() {
  const { user } = useSession();
  const { open, completed, unassigned, isLoading: statsLoading } = useTicketStats();
  const { data: ticketsData, isLoading: ticketsLoading } = useTickets('open');

  const stats = [
    { name: 'Open issues', value: open, tone: 'text-blue-600' },
    { name: 'Completed issues', value: completed, tone: 'text-emerald-600' },
    { name: 'Unassigned', value: unassigned, tone: 'text-amber-600' },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <section className="grid gap-6 rounded-3xl border border-border bg-card p-6 shadow-sm lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5" />
            Migrated workspace on the new client shell
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">
              Welcome back{user?.name ? `, ${user.name}` : ''}
            </h2>
            <p className="max-w-2xl text-sm text-muted-foreground">
              This dashboard now runs inside `mocha-client` with the new React, Next,
              Tailwind, and TanStack stack. The remaining admin, portal, and document
              surfaces can continue migrating on top of this shell.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/issues">
              <Button className="gap-2">
                View issues
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-2xl border border-border bg-background px-4 py-5"
            >
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                {stat.name}
              </p>
              <p className={`mt-3 text-3xl font-semibold ${stat.tone}`}>
                {statsLoading ? '...' : stat.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Recent issues</CardTitle>
              <CardDescription>Latest work from the open queue.</CardDescription>
            </div>
            <Link href="/issues">
              <Button variant="ghost" size="sm" className="gap-2">
                All issues
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticketsLoading ? (
              <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
                Loading issues...
              </div>
            ) : (
              ticketsData?.tickets?.slice(0, 6).map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/issue/${ticket.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3 transition-colors hover:bg-accent"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.id} · {ticket.assignedTo?.name ?? 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CircleDot className="h-3.5 w-3.5" />
                    {ticket.priority ?? 'Normal'}
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Next migration targets</CardTitle>
            <CardDescription>
              The heavier screens still to move from the legacy app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              Admin surface, roles, clients, and SMTP
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              Portal flows and external-user issue views
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3">
              Rich ticket detail editor and notebook/documents
            </div>
            <Button variant="premium" className="mt-2 w-full gap-2">
              <Plus className="h-4 w-4" />
              New issue flow next
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
