import { Suspense } from "react";
import { AuthFlowPageClient } from "@/components/migration/auth-flow-page";

export const dynamic = "force-dynamic";

export default async function AuthFlowPage({
  params,
}: {
  params: Promise<{ flow: string }>;
}) {
  const { flow } = await params;

  return (
    <Suspense fallback={null}>
      <AuthFlowPageClient flow={flow} />
    </Suspense>
  );
}
