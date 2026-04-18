'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocuments } from '@/hooks/use-documents';
import { api, formatDate } from '@/lib/api';
import type { Notebook } from '@/lib/types';

function sortDocuments(items: Notebook[]) {
  return [...items].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export default function DocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useDocuments();

  const createDocument = async () => {
    try {
      const result = await api<{ success?: boolean; id?: string }>('/api/v1/notebook/note/create', {
        method: 'POST',
        json: {
          title: 'Untitled',
          content: '',
        },
      });
      await queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (result.id) {
        router.push(`/documents/${result.id}`);
      }
    } catch (error) {
      console.error('Failed to create document', error);
    }
  };

  const notebooks = sortDocuments(data?.notebooks ?? []);

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Documents</CardTitle>
          <Button onClick={() => void createDocument()}>New document</Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Loading documents...
            </div>
          ) : notebooks.length ? (
            <div className="divide-y divide-border">
              {notebooks.map((notebook) => (
                <Link
                  key={notebook.id}
                  href={`/documents/${notebook.id}`}
                  className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-medium">{notebook.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Updated {formatDate(notebook.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              No documents yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
