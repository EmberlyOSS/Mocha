import { toast } from "@/shadcn/hooks/use-toast";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Login({}) {
  const router = useRouter();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [language, setLanguage] = useState("en");
  const [status, setStatus] = useState("idle");

  async function postData() {
    if (password === passwordConfirm && validateEmail(email)) {
      setStatus("loading");

      const response = await fetch("/api/v1/auth/user/register/external", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          passwordConfirm,
          language,
        }),
      }).then((res) => res.json());

      if (response.success) {
        setStatus("idle");
        router.push("/auth/login");
      } else {
        setStatus("idle");
        toast({
          variant: "destructive",
          title: "Error",
          description: response.message,
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match or email is invalid",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
          Create your new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {status === "loading" ? (
          <div className="text-center mr-4">{/* <Loader size={32} /> */}</div>
        ) : (
          <div className="bg-card py-8 px-4 border border-border rounded-lg sm:px-10">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-foreground"
                >
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-border bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-ring focus:border-ring sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="appearance-none block w-full px-3 py-2 border border-border bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-ring focus:border-ring sm:text-sm"
                  />
                </div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="password"
                    required
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-border bg-background text-foreground rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-ring focus:border-ring sm:text-sm"
                  />
                </div>

                <label className="block text-sm font-medium text-foreground">
                  Language
                </label>
                <div className="mt-1 rounded-md shadow-sm flex">
                  <select
                    id="language"
                    name="language"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-background text-foreground border-border focus:outline-none focus:ring-ring focus:border-ring sm:text-sm rounded-md border"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="se">Swedish</option>
                    <option value="es">Spanish</option>
                    <option value="no">Norwegian</option>
                    <option value="fr">French</option>
                    <option value="pt">Tagalong</option>
                    <option value="da">Danish</option>
                    <option value="pt">Portuguese</option>
                    <option value="it">Italiano</option>
                    <option value="he">Hebrew</option>
                    <option value="tr">Turkish</option>
                    <option value="hu">Hungarian</option>
                    <option value="th">Thai (ภาษาไทย)</option>
                    <option value="zh-CN">Simplified Chinese (简体中文)</option>
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  onClick={postData}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring"
                >
                  Create Account
                </button>

                <p className="mt-2 text-xs text-muted-foreground text-center">
                  Note this form is for external users only
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 text-center flex flex-col space-y-2">
          <span className="font-bold text-foreground">Built with ☕ by Emberly</span>
          <a href="https://mocha-docs.embrly.ca/" target="_blank" className="text-muted-foreground hover:text-foreground transition-colors">
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
