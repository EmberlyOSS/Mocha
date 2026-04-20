"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [status, setStatus] = useState("");

  if (!user) return null;

  const updateProfile = async () => {
    setStatus("Saving...");

    try {
      await api("/api/v1/auth/profile", {
        method: "PUT",
        json: {
          id: user.id,
          name,
          email,
          language,
        },
      });

      setUser({
        ...user,
        name,
        email,
        language,
      });
      setStatus("Profile saved.");
    } catch (error) {
      console.error("Failed to update profile", error);
      setStatus("Profile update failed.");
    }
  };

  return (
    <div className="p-0">
      <Card className="max-w-2xl rounded-[2rem] border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
        <CardHeader className="bg-accent/20 border-b border-border/40 pb-6">
          <CardTitle className="text-2xl">Profile</CardTitle>
          <CardDescription>Update your basic account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6 px-8">
          <div className="space-y-3">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="bg-background/50 h-11 px-4 text-base rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="bg-background/50 h-11 px-4 text-base rounded-xl"
            />
          </div>
          <div className="space-y-3">
            <Label>Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="bg-background/50 h-11 px-4 rounded-xl text-base">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className="cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3 border-t border-border/40 bg-accent/10 px-8 py-5 mt-4">
          <p className="text-sm font-medium text-muted-foreground">{status}</p>
          <Button
            size="lg"
            className="rounded-full px-8"
            onClick={() => void updateProfile()}
          >
            Save profile
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
