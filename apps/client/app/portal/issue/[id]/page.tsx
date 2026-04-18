'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalShell } from '@/components/portal/portal-shell';
import { api, formatDate } from '@/lib/api';
import { useTicket } from '@/hooks/use-tickets';

export default function PortalIssueDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const queryClient = useQueryClient();
  const { data, isLoading } = useTicket(id);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const ticket = data?.ticket;

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['ticket', id] }),
      queryClient.invalidateQueries({ queryKey: ['portal-tickets'] }),
    ]);
  };

  const toggleStatus = async () => {
    if (!ticket) return;
    setStatus('Saving...');
    try {
      await api('/api/v1/ticket/status/update', {
        method: 'PUT',
        json: { status: !ticket.isComplete, id },
      });
      await refresh();
      setStatus('Saved.');
    } catch (error) {
      console.error('Failed to update issue status', error);
      setStatus('Save failed.');
    }
  };

  const addComment = async () => {
    if (!comment.trim()) return;
    setStatus('Saving...');
    try {
      await api('/api/v1/ticket/comment', {
        method: 'POST',
        json: { text: comment, id, public: true },
      });
      setComment('');
      await refresh();
      setStatus('Comment added.');
    } catch (error) {
      console.error('Failed to add comment', error);
      setStatus('Comment failed.');
    }
  };

  return (
    <PortalShell>
      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? 'Loading issue...' : ticket?.title ?? 'Issue not found'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {ticket ? (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Issue</p>
                  <p className="mt-2 font-medium">#{ticket.Number ?? ticket.id}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Status</p>
                  <p className="mt-2 font-medium">{ticket.isComplete ? 'Closed' : 'Open'}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Created</p>
                  <p className="mt-2 font-medium">{formatDate(ticket.createdAt)}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Description</p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground/90">
                  {ticket.detail || ticket.note || 'No description.'}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="font-medium">Comments</p>
                  <Button variant="outline" size="sm" onClick={() => void toggleStatus()}>
                    {ticket.isComplete ? 'Reopen issue' : 'Close issue'}
                  </Button>
                </div>
                <div className="space-y-4">
                  {(ticket.comments ?? []).map((item) => (
                    <div key={item.id} className="rounded-xl border border-border px-4 py-3">
                      <p className="text-sm font-medium">{item.user.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                      <p className="mt-2 text-sm whitespace-pre-wrap">{item.text}</p>
                    </div>
                  ))}
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
                    placeholder="Leave a comment"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{status}</p>
                    <Button onClick={() => void addComment()}>Add comment</Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Issue data could not be loaded.</div>
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
