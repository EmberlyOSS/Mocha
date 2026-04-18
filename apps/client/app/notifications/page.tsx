'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, formatDate } from '@/lib/api';
import { setUser, useSession } from '@/lib/store';

export default function NotificationsPage() {
  const { user } = useSession();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const unread = user?.notifcations?.filter((item) => !item.read) ?? [];

  const markAsRead = async (id: string) => {
    if (!user) return;
    setPendingId(id);

    try {
      await api(`/api/v1/user/notifcation/${id}`);
      setUser({
        ...user,
        notifcations: user.notifcations.map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      });
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-5xl">
        <CardHeader>
          <CardTitle>
            {unread.length} unread notification{unread.length === 1 ? '' : 's'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {unread.length ? (
            unread.map((item) => (
              <Link
                key={item.id}
                href={item.ticketId ? `/issue/${item.ticketId}` : '/issues'}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-background px-4 py-4 transition-colors hover:bg-accent md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{item.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.createdAt)}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pendingId === item.id}
                  onClick={(event) => {
                    event.preventDefault();
                    void markAsRead(item.id);
                  }}
                >
                  {pendingId === item.id ? 'Saving...' : 'Mark as read'}
                </Button>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border px-4 py-14 text-center text-sm text-muted-foreground">
              You have no unread notifications.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
