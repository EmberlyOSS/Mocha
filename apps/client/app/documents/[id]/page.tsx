"use client";

import { useParams } from "next/navigation";
import { DocumentEditor } from "@/components/documents/document-editor";

export default function DocumentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="p-6 lg:p-8">
      <DocumentEditor id={id} />
    </div>
  );
}
