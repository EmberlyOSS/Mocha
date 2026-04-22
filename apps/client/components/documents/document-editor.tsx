"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDocument } from "@/hooks/use-documents";
import { api, formatDate } from "@/lib/api";

export function DocumentEditor({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isLoading } = useDocument(id);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (data?.note) {
      setTitle(data.note.title);
      setContent(data.note.note ?? "");
    }
  }, [data?.note]);

  const save = async () => {
    setStatus("Saving...");
    try {
      await api(`/api/v1/notebooks/note/${id}/update`, {
        method: "PUT",
        json: {
          title,
          content,
        },
      });
      setStatus("Saved.");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["document", id] }),
        queryClient.invalidateQueries({ queryKey: ["documents"] }),
      ]);
    } catch (error) {
      console.error("Failed to save document", error);
      setStatus("Save failed.");
    }
  };

  const remove = async () => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api(`/api/v1/notebooks/note/${id}`, {
        method: "DELETE",
      });
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
      router.replace("/documents");
    } catch (error) {
      console.error("Failed to delete document", error);
      setStatus("Delete failed.");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="px-6 py-14 text-center text-sm text-muted-foreground">
          Loading document...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-5xl">
      <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>Document editor</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Last updated: {formatDate(data?.note.updatedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void remove()}>
            Delete
          </Button>
          <Button onClick={() => void save()}>Save</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-2xl font-semibold outline-none"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="min-h-[60vh] w-full rounded-2xl border border-border bg-background px-4 py-4 text-sm outline-none"
          placeholder="Document content"
        />
        <p className="text-sm text-muted-foreground">{status}</p>
      </CardContent>
    </Card>
  );
}
