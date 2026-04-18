'use client';

import Link from 'next/link';
import { use, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAllTickets } from '@/hooks/use-tickets';

export default function FilteredIssuesPage({
  params,
}: {
  params: Promise<{ status: string }>;
}) {
  const { status } = use(params);
  const { data, isLoading } = useAllTickets();

  const tickets = useMemo(() => {
    const all = data?.tickets ?? [];
    if (status === 'open') {
      return all.filter((ticket) => !ticket.isComplete);
    }
    if (status === 'closed') {
      return all.filter((ticket) => Boolean(ticket.isComplete));
    }
    return [];
  }, [data?.tickets, status]);
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{status === 'closed' ? 'Closed issues' : 'Open issues'}</CardTitle>
            <CardDescription>
              Direct replacement for the old filtered issue pages.
            </CardDescription>
          </div>
          <Link href="/issues">
            <Button variant="outline" size="sm">
              All issues
            </Button>
          </Link>
        </CardHeader>
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
                  className="grid gap-3 px-6 py-4 transition-colors hover:bg-accent lg:grid-cols-[minmax(0,1.5fr)_160px_160px]"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{ticket.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {ticket.id} · {ticket.assignedTo?.name ?? 'Unassigned'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {ticket.priority ?? 'Normal'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(ticket.createdAt).toLocaleDateString('en-GB')}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No {status} issues were returned.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
