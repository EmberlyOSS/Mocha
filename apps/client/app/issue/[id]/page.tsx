'use client';

import { useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTicket } from '@/hooks/use-tickets';
import { formatDate } from '@/lib/api';

export default function IssueDetailPage() {
  const params = useParams<{ id: string }>();
  const ticketId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data, isLoading } = useTicket(ticketId);
  const ticket = data?.ticket;

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>{isLoading ? 'Loading issue...' : ticket?.title ?? 'Issue not found'}</CardTitle>
          <CardDescription>
            {ticket?.id ?? ticketId} · {ticket?.assignedTo?.name ?? 'Unassigned'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          {ticket ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Status</p>
                  <p className="mt-2 font-medium">{ticket.isComplete ? 'Closed' : ticket.status ?? 'Open'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Priority</p>
                  <p className="mt-2 font-medium">{ticket.priority ?? 'Normal'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Created</p>
                  <p className="mt-2 font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Note</p>
                <p className="mt-3 whitespace-pre-wrap text-foreground/90">
                  {ticket.note || ticket.detail || 'The rich editor view has not been migrated yet. This page is the thin detail shell for the new app.'}
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-6 text-muted-foreground">
              The issue payload could not be loaded.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
