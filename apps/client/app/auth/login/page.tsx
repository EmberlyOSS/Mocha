'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { setCookie } from 'cookies-next';
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

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oidcUrl, setOidcUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadOidcUrl = async () => {
      try {
        const data = await api<{ success?: boolean; url?: string }>('/api/v1/auth/check', {
          auth: false,
        });
        if (data.success && data.url) {
          setOidcUrl(data.url);
        }
      } catch (loadError) {
        console.error('Failed to load auth config', loadError);
      }
    };

    void loadOidcUrl();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      setError(
        'SSO login failed because no matching account was found. Ask an admin to provision the account first.',
      );
    }
  }, []);

  const handleLogin = async () => {
    setSubmitting(true);
    setError('');

    try {
      const result = await api<{ user?: { external_user?: boolean; firstLogin?: boolean }; token?: string }>(
        '/api/v1/auth/login',
        {
          method: 'POST',
          auth: false,
          json: { email, password },
        },
      );

      if (!result.user || !result.token) {
        setError('Login failed. Check the credentials and try again.');
        return;
      }

      setCookie('session', result.token);

      if (result.user.external_user) {
        router.replace('/portal');
        return;
      }

      router.replace(result.user.firstLogin ? '/onboarding' : '/');
      router.refresh();
    } catch (loginError) {
      console.error('Login failed', loginError);
      setError('Login failed. Check the credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] px-4 py-10">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-xl backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 text-lg font-semibold text-white">
            M
          </div>
          <div>
            <CardTitle className="text-2xl">Sign in to Mocha</CardTitle>
            <CardDescription>
              Migrated auth flow running inside `mocha-client`.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-0 transition focus:border-foreground/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none ring-0 transition focus:border-foreground/30"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  void handleLogin();
                }
              }}
            />
          </div>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm">
            <Link href="/auth/forgot-password" className="text-muted-foreground hover:text-foreground">
              Forgot password?
            </Link>
          </div>
          <div className="space-y-3">
            <Button className="w-full" onClick={() => void handleLogin()} disabled={submitting}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </Button>
            {oidcUrl ? (
              <Button variant="outline" className="w-full" onClick={() => router.push(oidcUrl)}>
                Sign in with OIDC
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
