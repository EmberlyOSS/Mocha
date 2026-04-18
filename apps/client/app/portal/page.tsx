'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalShell } from '@/components/portal/portal-shell';
import { PortalTicketList } from '@/components/portal/portal-ticket-list';
import { usePortalTickets } from '@/hooks/use-tickets';

export default function PortalPage() {
  const { data, isLoading } = usePortalTickets('open');
  const tickets = data?.tickets ?? [];

  return (
    <PortalShell>
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <PortalTicketList
          tickets={tickets.slice(0, 10)}
          emptyLabel={isLoading ? 'Loading portal issues...' : 'No open portal issues yet.'}
        />
        <Card>
          <CardHeader>
            <CardTitle>Portal actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Create and track external customer issues from the new client shell.</p>
            <Link href="/portal/new">
              <Button className="w-full gap-2">
                <Plus className="h-4 w-4" />
                New issue
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </PortalShell>
  );
}
