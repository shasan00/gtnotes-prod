import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { SearchFilterProvider } from "@/context/SearchFilterContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import NotFound from "./pages/NotFound";
import NoteDetail from "./pages/NoteDetail";
import UploadPage from "./pages/UploadPage";
import Profile from "./pages/Profile";
import Admin from "@/pages/Admin";
import { createContext, useContext, useEffect, useState } from "react";
import { getSession } from "@/lib/auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SearchFilterProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in" element={<SignIn />} />
              <Route path="/upload" element={<Protected><UploadPage /></Protected>} />
              <Route path="/profile" element={<Protected><Profile /></Protected>} />
              <Route path="/admin" element={<AdminProtected><Admin /></AdminProtected>} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SearchFilterProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

function useAuthState() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const run = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
      if (token) {
        setIsAuthed(true);
        setIsLoading(false);
        return;
      }
      const session = await getSession();
      if (session) {
        // Try to exchange for API token
        const resp = await fetch("/api/session/me", { credentials: "include" });
        if (resp.ok) {
          const data = await resp.json();
          if (data?.token) {
            localStorage.setItem("auth_token", data.token);
            setIsAuthed(true);
          }
        }
      }
      setIsLoading(false);
    };
    run();
  }, []);

  return { isLoading, isAuthed };
}

function Protected({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthed } = useAuthState();
  if (isLoading) return null;
  if (!isAuthed) {
    window.location.href = "/sign-in";
    return null;
  }
  return children;
}

function AdminProtected({ children }: { children: React.ReactNode }) {
  const { isLoading, isAuthed } = useAuthState();
  if (isLoading) return null;
  if (!isAuthed) {
    window.location.href = "/sign-in";
    return null;
  }
  try {
    const token = localStorage.getItem("auth_token");
    if (!token) throw new Error("missing token");
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "===".slice((base64.length + 3) % 4);
    const payload = JSON.parse(atob(padded));
    if (payload?.role !== "admin") {
      window.location.href = "/";
      return null;
    }
  } catch {
    window.location.href = "/sign-in";
    return null;
  }
  return children;
}