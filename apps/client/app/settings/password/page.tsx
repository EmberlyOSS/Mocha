'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';

export default function PasswordSettingsPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const updatePassword = async () => {
    if (!password || password !== confirmPassword) {
      setStatus('Passwords must match.');
      return;
    }

    setSubmitting(true);
    setStatus('');

    try {
      await api('/api/v1/auth/reset-password', {
        method: 'POST',
        json: { password },
      });
      setStatus('Password updated.');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Replaces the legacy `/settings/password` flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-sm text-muted-foreground">{status}</p>
          <Button onClick={() => void updatePassword()} disabled={submitting}>
            {submitting ? 'Updating...' : 'Update password'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
