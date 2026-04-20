"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const settingsSections = [
  {
    href: "/settings/notifications",
    title: "Notification preferences",
    description: "Email and ticket notification toggles.",
  },
  {
    href: "/settings/sessions",
    title: "Sessions",
    description: "Review active devices and revoke old sessions.",
  },
  {
    href: "/settings/flags",
    title: "Feature flags",
    description: "Local client-side switches preserved from the legacy app.",
  },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8 p-0">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight">
          Settings Workspace
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Configure and personalize your client experience.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {settingsSections.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden transition-all hover:bg-accent/40 h-full flex flex-col group">
              <CardHeader className="bg-accent/10 border-b border-border/20 px-6 py-6 pb-5 flex-1">
                <CardTitle className="text-xl font-bold">
                  {section.title}
                </CardTitle>
                <CardDescription className="text-[14px] mt-2 leading-relaxed font-medium">
                  {section.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 py-4 flex items-center justify-between text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                <span>Configure view</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
