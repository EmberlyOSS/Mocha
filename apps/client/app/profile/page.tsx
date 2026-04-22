"use client";

import { useState } from "react";
import {
  PiFloppyDiskDuotone,
  PiUserCircleDuotone,
  PiEnvelopeDuotone,
  PiTranslateDuotone,
  PiShieldCheckDuotone,
} from "react-icons/pi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/lib/api";
import { setUser, useSession } from "@/lib/store";

const languages = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "se", label: "Swedish" },
  { value: "es", label: "Spanish" },
  { value: "no", label: "Norwegian" },
  { value: "fr", label: "French" },
  { value: "tl", label: "Tagalog" },
  { value: "da", label: "Danish" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italiano" },
  { value: "he", label: "Hebrew" },
  { value: "tr", label: "Turkish" },
  { value: "hu", label: "Hungarian" },
  { value: "th", label: "Thai" },
  { value: "zh-CN", label: "Simplified Chinese" },
];

export default function ProfilePage() {
  const { user } = useSession();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [language, setLanguage] = useState(user?.language ?? "en");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  if (!user) return null;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updateProfile = async () => {
    setStatus("saving");
    try {
      await api("/api/v1/auth/profile", {
        method: "PUT",
        json: { id: user.id, name, email, language },
      });
      setUser({ ...user, name, email, language });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      setStatus("error");
    }
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 pb-10 max-w-2xl w-full">
        {/* ── Header ── */}
        <div className="space-y-0.5">
          <h1 className="text-3xl font-bold tracking-tight text-white">Profile</h1>
          <p className="text-zinc-500">Manage your account information.</p>
        </div>

        {/* ── Avatar card ── */}
        <div className="flex items-center gap-5 rounded-2xl border border-white/5 bg-[#09090b] p-6">
          <Avatar className="h-16 w-16 rounded-2xl ring-2 ring-white/5">
            <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
            <AvatarFallback className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 text-lg font-bold text-white">
              {initials || <PiUserCircleDuotone className="h-7 w-7" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-lg truncate">{user.name}</p>
            <p className="text-sm text-zinc-500 truncate">{user.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="flex items-center gap-1.5 rounded-full border-white/10 bg-white/5 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 px-2.5 py-0.5"
              >
                <PiShieldCheckDuotone className="h-3 w-3 text-violet-400" />
                {user.isAdmin ? "Administrator" : "Team Member"}
              </Badge>
            </div>
          </div>
        </div>

        <Separator className="bg-white/5" />

        {/* ── Form ── */}
        <div className="rounded-2xl border border-white/5 bg-[#09090b] overflow-hidden">
          <div className="border-b border-white/5 bg-[#0a0a0c] px-6 py-4">
            <p className="text-sm font-semibold text-white">Account details</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Changes are applied immediately after saving.
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                <PiUserCircleDuotone className="h-3.5 w-3.5" />
                Display name
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="h-11 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder-zinc-600 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                <PiEnvelopeDuotone className="h-3.5 w-3.5" />
                Email address
              </Label>
              <Input
                id="profile-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl bg-white/[0.04] border-white/10 text-white placeholder-zinc-600 focus-visible:ring-1 focus-visible:ring-violet-500/40"
              />
            </div>

            {/* Language */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
                <PiTranslateDuotone className="h-3.5 w-3.5" />
                Language
              </Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  id="profile-language"
                  className="h-11 rounded-xl bg-white/[0.04] border-white/10 text-zinc-300 focus:ring-1 focus:ring-violet-500/40"
                >
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {languages.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between gap-4 border-t border-white/5 bg-[#0a0a0c] px-6 py-4">
            <p className="text-xs font-medium">
              {status === "saving" && (
                <span className="text-zinc-500">Saving…</span>
              )}
              {status === "saved" && (
                <span className="text-emerald-400">Profile saved!</span>
              )}
              {status === "error" && (
                <span className="text-red-400">Save failed. Try again.</span>
              )}
            </p>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  id="profile-save"
                  onClick={() => void updateProfile()}
                  disabled={status === "saving"}
                  className="gap-2 rounded-full px-6 h-9 font-semibold bg-white text-black hover:bg-zinc-200 disabled:opacity-50"
                >
                  <PiFloppyDiskDuotone className="h-4 w-4" />
                  {status === "saving" ? "Saving…" : "Save changes"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Save your profile changes</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
