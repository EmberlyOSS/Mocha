'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, formatDate, getPrettyUserAgent } from '@/lib/api';
import { useSessions } from '@/hooks/use-settings';

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useSessions();

  const revokeSession = async (sessionId: string) => {
    try {
      await api(`/api/v1/auth/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      await queryClient.invalidateQueries({ queryKey: ['sessions'] });
    } catch (error) {
      console.error('Failed to revoke session', error);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Active sessions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
              Loading sessions...
            </div>
          ) : (
            data?.sessions?.map((session) => (
              <div
                key={session.id}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-background px-4 py-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1 text-sm">
                  <p className="font-medium">
                    {session.ipAddress === '::1' ? 'Localhost' : session.ipAddress}
                  </p>
                  <p className="text-muted-foreground">{getPrettyUserAgent(session.userAgent)}</p>
                  <p className="text-muted-foreground">Created: {formatDate(session.createdAt)}</p>
                  <p className="text-muted-foreground">Expires: {formatDate(session.expires)}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => void revokeSession(session.id)}>
                  Revoke
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
