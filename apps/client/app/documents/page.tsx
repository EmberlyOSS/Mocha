"use client";

import { FileText, Plus, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
          json: { title: "Untitled", content: "" },
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
    <div className="flex flex-col gap-6 pb-10 max-w-5xl w-full">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Documents
          </h1>
          <p className="text-zinc-500 text-base">
            {isLoading
              ? "Loading…"
              : `${notebooks.length} document${notebooks.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button
          id="docs-new"
          onClick={() => void createDocument()}
          className="h-10 gap-2 rounded-full px-6 font-semibold bg-white text-black hover:bg-zinc-200"
        >
          <Plus className="h-4 w-4" />
          New document
        </Button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/5 bg-[#09090b] overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-sm text-zinc-600 font-medium">
            Loading documents…
          </div>
        ) : notebooks.length ? (
          <div className="divide-y divide-white/5">
            {notebooks.map((notebook, i) => (
              <Link
                key={notebook.id}
                href={`/documents/${notebook.id}`}
                className="group flex items-center gap-5 px-6 py-4 transition-colors hover:bg-white/[0.025]"
              >
                {/* Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] transition group-hover:border-white/10 group-hover:bg-white/[0.07]">
                  <FileText className="h-4 w-4 text-zinc-500 group-hover:text-zinc-400 transition" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm text-zinc-200 group-hover:text-white transition-colors">
                    {notebook.title || "Untitled"}
                  </p>
                  <p className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-600">
                    <Clock className="h-3 w-3" />
                    Updated {formatDate(notebook.updatedAt)}
                  </p>
                </div>

                {/* Index pill */}
                <span className="hidden sm:block text-[10px] font-mono text-zinc-700">
                  #{String(i + 1).padStart(2, "0")}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03]">
              <FileText className="h-6 w-6 text-zinc-700" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-zinc-400">No documents yet</p>
              <p className="text-xs text-zinc-600">
                Click &quot;New document&quot; to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
