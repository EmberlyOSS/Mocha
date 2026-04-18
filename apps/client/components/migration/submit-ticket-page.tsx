'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

const ticketTypes = ['Incident', 'Service', 'Feature', 'Bug', 'Maintenance', 'Access', 'Feedback'];

export function SubmitTicketPageClient() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('id');
  const [status, setStatus] = useState('');
  const [submittedId, setSubmittedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    description: '',
    priority: 'Low',
    type: 'Feature',
  });

  const submit = async () => {
    if (!companyId) {
      setStatus('Missing company id. Open this page with `?id=<company-id>`.');
      return;
    }

    setSubmitting(true);
    setStatus('');

    try {
      const response = await api<{ success?: boolean; id?: string }>('/api/v1/ticket/public/create', {
        method: 'POST',
        auth: false,
        json: {
          name: form.name,
          title: form.subject,
          company: companyId,
          email: form.email,
          detail: form.description,
          priority: form.priority,
          type: form.type,
        },
      });

      if (response.success) {
        setSubmittedId(response.id ?? '');
        setStatus('Ticket submitted successfully.');
      } else {
        setStatus('Please fill out all fields and try again.');
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Ticket submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 lg:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Submit a ticket</CardTitle>
          <CardDescription>
            Public ticket submission migrated from the old `/submit` page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </Field>
          <Field label="Subject">
            <input
              value={form.subject}
              onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Issue type">
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                {ticketTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </Field>
          </div>
          <Field label="Description">
            <textarea
              rows={6}
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </Field>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {submittedId ? `Ticket id: ${submittedId}` : status}
            </p>
            <Button onClick={() => void submit()} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit ticket'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
