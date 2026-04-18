'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FeatureFlag } from '@/lib/types';

const defaultFlags: FeatureFlag[] = [
  {
    name: 'Hide Keyboard Shortcuts',
    enabled: false,
    description: 'Hide keyboard shortcuts.',
    flagKey: 'keyboard_shortcuts_hide',
  },
  {
    name: 'Hide Name in Create',
    enabled: false,
    description: 'Hide the name field in the create issue flow.',
    flagKey: 'name_hide',
  },
  {
    name: 'Hide Email in Create',
    enabled: false,
    description: 'Hide the email field in the create issue flow.',
    flagKey: 'email_hide',
  },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    const savedFlags = window.localStorage.getItem('featureFlags');
    if (!savedFlags) {
      setFlags(defaultFlags);
      window.localStorage.setItem('featureFlags', JSON.stringify(defaultFlags));
      return;
    }

    const parsedFlags = JSON.parse(savedFlags) as FeatureFlag[];
    const merged = defaultFlags.map(
      (flag) => parsedFlags.find((savedFlag) => savedFlag.name === flag.name) ?? flag,
    );
    setFlags(merged);
    window.localStorage.setItem('featureFlags', JSON.stringify(merged));
  }, []);

  const toggle = (name: string) => {
    setFlags((current) => {
      const next = current.map((flag) =>
        flag.name === name ? { ...flag, enabled: !flag.enabled } : flag,
      );
      window.localStorage.setItem('featureFlags', JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Feature flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {flags.map((flag) => (
            <div
              key={flag.name}
              className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-background px-4 py-4"
            >
              <div>
                <p className="font-medium">{flag.name}</p>
                <p className="text-sm text-muted-foreground">{flag.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(flag.name)}
                className="rounded-xl border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-accent"
              >
                {flag.enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
