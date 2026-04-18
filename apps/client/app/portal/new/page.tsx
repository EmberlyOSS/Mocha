'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PortalShell } from '@/components/portal/portal-shell';
import { api } from '@/lib/api';
import { useSession } from '@/lib/store';

const issueTypes = ['Incident', 'Service', 'Feature', 'Bug', 'Maintenance', 'Access', 'Feedback'];
const priorities = ['Low', 'Medium', 'High'];

export default function PortalNewIssuePage() {
  const router = useRouter();
  const { user } = useSession();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('Bug');
  const [priority, setPriority] = useState('Low');
  const [status, setStatus] = useState('');

  const submit = async () => {
    if (!user) return;
    setStatus('Submitting...');
    try {
      const result = await api<{ success?: boolean; id?: string }>('/api/v1/ticket/create', {
        method: 'POST',
        auth: false,
        json: {
          name: user.name,
          title: subject,
          email: user.email,
          detail: description,
          priority,
          type: issueType,
          createdBy: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
        },
      });
      if (result.success) {
        router.replace(result.id ? `/portal/issue/${result.id}` : '/portal');
        return;
      }
      setStatus('Ticket creation failed.');
    } catch (error) {
      console.error('Failed to create portal issue', error);
      setStatus('Ticket creation failed.');
    }
  };

  return (
    <PortalShell>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Submit a new issue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue type</label>
              <select
                value={issueType}
                onChange={(event) => setIssueType(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                {issueTypes.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
              >
                {priorities.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-40 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{status}</p>
            <div className="flex gap-2">
              <Link href="/portal">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={() => void submit()}>Submit issue</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </PortalShell>
  );
}
