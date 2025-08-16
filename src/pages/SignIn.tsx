import React from "react";
import { NotebookPen } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { LoginForm } from "@/components/Login-form";
import Header from "@/components/Header";
import { getSession } from "@/lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // After OAuth redirect: fetch session and store our API JWT
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const success = params.get("success");

    const handlePostAuth = async () => {
      try {
        const session = await getSession();
        if (session) {
          const resp = await fetch(`${API_BASE_URL}/api/session/me`, { credentials: "include" });
          if (resp.ok) {
            const data = await resp.json();
            if (data?.token) {
              localStorage.setItem("auth_token", data.token);
              navigate("/");
              return;
            }
          }
        }
      } catch (e) {
        // ignore; user can try again
      }
    };

    if (success) {
      handlePostAuth();
    }
  }, [location.search, navigate]);

  // Check if user is already authenticated (has JWT stored)
  React.useEffect(() => {
    const checkAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token) {
        navigate("/");
        return;
      }
      const session = await getSession();
      if (session) {
        // Try to exchange for API token if not stored yet
        const resp = await fetch(`${API_BASE_URL}/api/session/me`, { credentials: "include" });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.token) {
            localStorage.setItem("auth_token", data.token);
            navigate("/");
          }
        }
      }
    };
    checkAuth();
  }, [navigate]);

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
