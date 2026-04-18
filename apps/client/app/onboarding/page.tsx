'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OnboardingPage() {
  return (
    <div className="p-6 lg:p-8">
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Onboarding migration pending</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          First-login onboarding exists in the legacy app but has not been moved yet. The new
          client now has a stable landing route for that flow.
        </CardContent>
      </Card>
    </div>
  );
}
