import { Suspense } from "react";
import { SubmitTicketPageClient } from "@/components/pages/submit-ticket-page";

export const dynamic = "force-dynamic";

export default function SubmitTicketPage() {
  return (
    <Suspense fallback={null}>
      <SubmitTicketPageClient />
    </Suspense>
  );
}
