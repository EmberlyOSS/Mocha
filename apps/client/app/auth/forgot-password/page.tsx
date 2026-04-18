'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    setStatus('');

    try {
      const result = await api<{ success?: boolean }>('/api/v1/auth/password-reset', {
        method: 'POST',
        auth: false,
        json: { email, link: window.location.origin },
      });

      if (result.success) {
        setStatus('Password reset email sent.');
        router.replace('/auth/login');
        return;
      }

      setStatus('Password reset request failed.');
    } catch (error) {
      console.error('Password reset failed', error);
      setStatus('Password reset request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] px-4 py-10">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-xl backdrop-blur">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Send a password reset link to your email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          {status ? (
            <div className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
              {status}
            </div>
          ) : null}
          <div className="space-y-3">
            <Button className="w-full" onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit request'}
            </Button>
            <Link href="/auth/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
