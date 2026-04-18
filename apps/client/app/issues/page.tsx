'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAllTickets } from '@/hooks/use-tickets';
import type { Ticket } from '@/lib/types';

function badgeTone(ticket: Ticket) {
  const priority = ticket.priority?.toLowerCase();
  if (priority === 'high') return 'bg-red-50 text-red-700';
  if (priority === 'normal' || priority === 'medium') return 'bg-amber-50 text-amber-700';
  return 'bg-blue-50 text-blue-700';
}

export default function IssuesPage() {
  const { data, isLoading } = useAllTickets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  const tickets = useMemo(() => {
    const source = data?.tickets ?? [];
    return source.filter((ticket) => {
      const matchesQuery =
        !query ||
        ticket.title.toLowerCase().includes(query.toLowerCase()) ||
        ticket.id.toLowerCase().includes(query.toLowerCase()) ||
        ticket.assignedTo?.name?.toLowerCase().includes(query.toLowerCase());

      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'closed'
            ? Boolean(ticket.isComplete)
            : !ticket.isComplete;

      return matchesQuery && matchesFilter;
    });
  }, [data?.tickets, filter, query]);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <Card className="hover:shadow-xs">
        <CardHeader className="gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <CardTitle>Issue workspace</CardTitle>
            <CardDescription>
              Migrated from the old `pages/issues` flow into the new client shell.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'open', 'closed'] as const).map((value) => (
              <Button
                key={value}
                variant={filter === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(value)}
              >
                {value}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, issue id, or assignee"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Loading issues...
            </div>
          ) : tickets.length ? (
            <div className="divide-y divide-border">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/issue/${ticket.id}`}
                  className="grid gap-3 px-6 py-4 transition-colors hover:bg-accent lg:grid-cols-[minmax(0,1.5fr)_140px_140px_160px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{ticket.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticket.id} · {ticket.assignedTo?.name ?? 'Unassigned'}
                    </p>
                  </div>
                  <div>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${badgeTone(ticket)}`}>
                      {ticket.priority ?? 'Low'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.isComplete ? 'Closed' : 'Open'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No issues matched the current filters.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
