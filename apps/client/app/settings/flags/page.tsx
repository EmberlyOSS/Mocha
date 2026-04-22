"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeatureFlag } from "@/lib/types";

const defaultFlags: FeatureFlag[] = [
  {
    name: "Hide Keyboard Shortcuts",
    enabled: false,
    description: "Hide keyboard shortcuts.",
    flagKey: "keyboard_shortcuts_hide",
  },
  {
    name: "Hide Name in Create",
    enabled: false,
    description: "Hide the name field in the create issue flow.",
    flagKey: "name_hide",
  },
  {
    name: "Hide Email in Create",
    enabled: false,
    description: "Hide the email field in the create issue flow.",
    flagKey: "email_hide",
  },
];

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);

  useEffect(() => {
    const savedFlags = window.localStorage.getItem("featureFlags");
    if (!savedFlags) {
      setFlags(defaultFlags);
      window.localStorage.setItem("featureFlags", JSON.stringify(defaultFlags));
      return;
    }

    const parsedFlags = JSON.parse(savedFlags) as FeatureFlag[];
    const merged = defaultFlags.map(
      (flag) =>
        parsedFlags.find((savedFlag) => savedFlag.name === flag.name) ?? flag,
    );
    setFlags(merged);
    window.localStorage.setItem("featureFlags", JSON.stringify(merged));
  }, []);

  const toggle = (name: string) => {
    setFlags((current) => {
      const next = current.map((flag) =>
        flag.name === name ? { ...flag, enabled: !flag.enabled } : flag,
      );
      window.localStorage.setItem("featureFlags", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="pb-10">
      <Card className="max-w-3xl overflow-hidden rounded-[28px] border-white/[0.08] bg-[#09090b] shadow-[0_28px_80px_rgba(0,0,0,0.35)]">
        <CardHeader className="border-b border-white/[0.08] bg-white/[0.02]">
          <CardTitle className="text-white">Feature flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-6">
          {flags.map((flag) => (
            <div
              key={flag.name}
              className="flex items-start justify-between gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-4"
            >
              <div>
                <p className="font-medium text-white">{flag.name}</p>
                <p className="text-sm text-zinc-500">
                  {flag.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggle(flag.name)}
                className="rounded-full border border-white/[0.08] px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-white/5"
              >
                {flag.enabled ? "Disable" : "Enable"}
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
