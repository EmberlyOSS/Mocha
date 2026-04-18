'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerLink?: {
    href: string;
    label: string;
  };
}

export function AuthShell({ title, description, children, footerLink }: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] px-4 py-10">
      <Card className="w-full max-w-md border-white/70 bg-white/90 shadow-xl backdrop-blur">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 text-lg font-semibold text-white">
            M
          </div>
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {children}
          {footerLink ? (
            <div className="pt-2 text-center text-sm text-muted-foreground">
              <Link href={footerLink.href} className="hover:text-foreground">
                {footerLink.label}
              </Link>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
