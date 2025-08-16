import React from "react";
import { NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/Login-form";
import Header from "@/components/Header";
import { getSession } from "@/lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();

  // Check if user is already authenticated
  React.useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();
      if (session) {
        // User is already authenticated, redirect to home
        navigate("/");
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
