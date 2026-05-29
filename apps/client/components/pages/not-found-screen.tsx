import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function NotFoundScreen() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6 lg:p-8">
      <Card className="w-full max-w-xl text-center">
        <CardHeader className="space-y-4">
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Error 404
          </div>
          <CardTitle className="text-3xl">
            This route is not available
          </CardTitle>
          <CardDescription>
            The page you requested could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center gap-3">
          <Link href="/">
            <Button>Back to dashboard</Button>
          </Link>
          <Link href="/issues">
            <Button variant="outline">Browse issues</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
