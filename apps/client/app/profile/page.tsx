'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { api } from '@/lib/api';
import { setUser, useSession } from '@/lib/store';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'German' },
  { value: 'se', label: 'Swedish' },
  { value: 'es', label: 'Spanish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'fr', label: 'French' },
  { value: 'tl', label: 'Tagalong' },
  { value: 'da', label: 'Danish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'it', label: 'Italiano' },
  { value: 'he', label: 'Hebrew' },
  { value: 'tr', label: 'Turkish' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'th', label: 'Thai' },
  { value: 'zh-CN', label: 'Simplified Chinese' },
];

export default function ProfilePage() {
  const { user } = useSession();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [language, setLanguage] = useState(user?.language ?? 'en');
  const [status, setStatus] = useState('');

  if (!user) return null;

  const updateProfile = async () => {
    setStatus('Saving...');

    try {
      await api('/api/v1/auth/profile', {
        method: 'PUT',
        json: {
          id: user.id,
          name,
          email,
          language,
        },
      });

      setUser({
        ...user,
        name,
        email,
        language,
      });
      setStatus('Profile saved.');
    } catch (error) {
      console.error('Failed to update profile', error);
      setStatus('Profile update failed.');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your basic account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Language</label>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            >
              {languages.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-sm text-muted-foreground">{status}</p>
          <Button onClick={() => void updateProfile()}>Save profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
