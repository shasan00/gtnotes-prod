import React from "react";
import { NotebookPen } from "lucide-react";

import { LoginForm } from "@/components/Login-form";
import Header  from "@/components/Header";

export default function LoginPage() {
  // hands token returned from OAuth callback redirect (might change idk)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("auth_token", token);
      window.history.replaceState({}, document.title, window.location.pathname);
      window.location.href = "/";
    }
  }, []);

  return (
    <>
      <Header/>
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-md flex-col gap-6">
          <a href="#" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <NotebookPen className="size-4 text-gt-gold" />
            </div>
            GT Notes
          </a>
          <LoginForm />
        </div>
      </div>
    </>
  );
}
