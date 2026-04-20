"use client";

import { setCookie } from "cookies-next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthShell } from "@/components/migration/auth-shell";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const languages = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
  { value: "se", label: "Swedish" },
  { value: "es", label: "Spanish" },
  { value: "no", label: "Norwegian" },
  { value: "fr", label: "French" },
  { value: "tl", label: "Tagalong" },
  { value: "da", label: "Danish" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italiano" },
  { value: "he", label: "Hebrew" },
  { value: "tr", label: "Turkish" },
  { value: "hu", label: "Hungarian" },
  { value: "th", label: "Thai" },
  { value: "zh-CN", label: "Simplified Chinese" },
];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function RegisterFlow() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email)) {
      setStatus("Enter a valid email address.");
      return;
    }
    if (!password || password !== passwordConfirm) {
      setStatus("Passwords must match.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      await api("/api/v1/auth/user/register/external", {
        method: "POST",
        auth: false,
        json: {
          name,
          email,
          password,
          passwordConfirm,
          language,
        },
      });

      router.replace("/auth/login");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Registration failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      description="External user registration migrated into the new client shell."
      footerLink={{ href: "/auth/login", label: "Back to sign in" }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium">Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Password</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Confirm password</label>
        <input
          type="password"
          value={passwordConfirm}
          onChange={(event) => setPasswordConfirm(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Language</label>
        <select
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
        >
          {languages.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {status ? (
        <div className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          {status}
        </div>
      ) : null}
      <Button
        className="w-full"
        onClick={() => void submit()}
        disabled={submitting}
      >
        {submitting ? "Creating account..." : "Create account"}
      </Button>
    </AuthShell>
  );
}

function ResetPasswordFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"code" | "password">("code");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = searchParams.get("token");

  const verifyCode = async () => {
    if (!token) {
      setStatus("Missing reset token.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      await api("/api/v1/auth/password-reset/code", {
        method: "POST",
        auth: false,
        json: { code, uuid: token },
      });
      setStep("password");
      setStatus("Code accepted. Set a new password.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invalid reset code.");
    } finally {
      setSubmitting(false);
    }
  };

  const updatePassword = async () => {
    if (!password) {
      setStatus("Password cannot be empty.");
      return;
    }

    setSubmitting(true);
    setStatus("");

    try {
      await api("/api/v1/auth/password-reset/password", {
        method: "POST",
        auth: false,
        json: { code, password },
      });
      router.replace("/auth/login");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Password update failed.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      description="Migrated password reset flow for email reset links."
      footerLink={{ href: "/auth/login", label: "Back to sign in" }}
    >
      {step === "code" ? (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Verification code</label>
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => void verifyCode()}
            disabled={submitting}
          >
            {submitting ? "Checking code..." : "Check code"}
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">New password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
            />
          </div>
          <Button
            className="w-full"
            onClick={() => void updatePassword()}
            disabled={submitting}
          >
            {submitting ? "Updating password..." : "Change password"}
          </Button>
        </>
      )}
      {status ? (
        <div className="rounded-2xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          {status}
        </div>
      ) : null}
    </AuthShell>
  );
}

function CallbackFlow({
  title,
  description,
  callback,
}: {
  title: string;
  description: string;
  callback: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Checking callback...");

  const queryString = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    return params.toString();
  }, [searchParams]);

  useEffect(() => {
    const run = async () => {
      if (!queryString) {
        setStatus("Waiting for provider callback parameters.");
        return;
      }

      try {
        const response = await api<{
          success?: boolean;
          token?: string;
          onboarding?: boolean;
        }>(`${callback}?${queryString}`, { auth: false });

        if (!response.success || !response.token) {
          router.replace("/auth/login?error=account_not_found");
          return;
        }

        setCookie("session", response.token, { maxAge: 60 * 60 * 24 * 6 });
        router.replace(response.onboarding ? "/onboarding" : "/");
      } catch {
        router.replace("/auth/login?error=account_not_found");
      }
    };

    void run();
  }, [callback, queryString, router]);

  return (
    <AuthShell title={title} description={description}>
      <div className="rounded-2xl border border-border bg-background px-3 py-3 text-sm text-muted-foreground">
        {status}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="hover:text-foreground">
          Return to sign in
        </Link>
      </div>
    </AuthShell>
  );
}

export function AuthFlowPageClient({ flow }: { flow: string }) {
  if (flow === "register") {
    return <RegisterFlow />;
  }

  if (flow === "reset-password") {
    return <ResetPasswordFlow />;
  }

  if (flow === "oauth") {
    return (
      <CallbackFlow
        title="Completing OAuth sign in"
        description="Finishing the migrated OAuth callback flow."
        callback="/api/v1/auth/oauth/callback"
      />
    );
  }

  if (flow === "oidc") {
    return (
      <CallbackFlow
        title="Completing OIDC sign in"
        description="Finishing the migrated OIDC callback flow."
        callback="/api/v1/auth/oidc/callback"
      />
    );
  }

  return (
    <AuthShell
      title="Unsupported auth route"
      description={`No migrated auth flow exists for "${flow}".`}
    >
      <div className="text-center text-sm text-muted-foreground">
        <Link href="/auth/login" className="hover:text-foreground">
          Back to sign in
        </Link>
      </div>
    </AuthShell>
  );
}
