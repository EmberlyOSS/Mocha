"use client";

import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDocuments } from "@/hooks/use-documents";
import { api, formatDate } from "@/lib/api";
import type { Notebook } from "@/lib/types";

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
      const result = await api<{ success?: boolean; id?: string }>(
        "/api/v1/notebook/note/create",
        {
          method: "POST",
          json: {
            title: "Untitled",
            content: "",
          },
        },
      );
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      if (result.id) {
        router.push(`/documents/${result.id}`);
      }
    } catch (error) {
      console.error("Failed to create document", error);
    }
  };

  const notebooks = sortDocuments(data?.notebooks ?? []);

  return (
    <div className="flex flex-col gap-6 p-0 max-w-6xl w-full">
      <Card className="rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-accent/20 px-8 py-6">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Documents</CardTitle>
            <CardDescription className="text-base">
              Collaborative knowledge base and notes.
            </CardDescription>
          </div>
          <Button
            size="lg"
            className="rounded-full px-6 font-semibold"
            onClick={() => void createDocument()}
          >
            New document
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="px-8 py-20 text-center font-medium text-muted-foreground">
              Loading documents...
            </div>
          ) : notebooks.length ? (
            <div className="divide-y divide-border/40">
              {notebooks.map((notebook) => (
                <Link
                  key={notebook.id}
                  href={`/documents/${notebook.id}`}
                  className="flex items-center justify-between px-8 py-5 transition-colors hover:bg-accent/40"
                >
                  <div className="space-y-1">
                    <p className="font-semibold text-base">{notebook.title}</p>
                    <p className="text-xs font-medium text-muted-foreground">
                      Updated {formatDate(notebook.updatedAt)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-8 py-20 text-center font-medium text-muted-foreground">
              No documents yet. Click "New document" to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
