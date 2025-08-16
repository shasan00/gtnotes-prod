import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSearchFilter } from "@/context/SearchFilterContext";
import { useDebounce } from "@/hooks/useDebounce";
import { getSession, signOut } from "@/lib/auth";

const Header = () => {
  const { searchQuery, setSearchQuery } = useSearchFilter();
  const [inputValue, setInputValue] = useState(searchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Debounce the search input to avoid too many re-renders
  const debouncedSearchTerm = useDebounce(inputValue, 300);
  
  // Update the search query when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearchTerm);
  }, [debouncedSearchTerm, setSearchQuery]);
  
  // Focus the search input when '/' is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleClearSearch = () => {
    setInputValue('');
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card text-foreground shadow-sm">
      {/* Desktop (md+) */}
      <div className="hidden md:grid h-16 px-6 grid-cols-[1fr_minmax(0,48rem)_1fr] items-center max-w-[2000px] mx-auto">
        {/* Left */}
        <div className="flex items-center justify-start">
          <Link to="/" className="text-2xl font-bold text-gt-gold hover:text-gt-gold/90 whitespace-nowrap">
            GT Notes
          </Link>
        </div>
        {/* Center - search */}
        <div className="relative w-full max-w-2xl mx-auto px-4">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search notes, professors, classes..."
              value={inputValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-8 py-2 rounded-md border border-input focus:ring-gt-gold focus:border-gt-gold bg-background"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            {inputValue ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none flex items-center border border-muted-foreground/20 rounded px-1.5 py-0.5 text-xs text-muted-foreground">
                /
              </div>
            )}
          </div>
        </div>
        {/* Right */}
        <div className="flex items-center justify-end space-x-4">
          <Button asChild variant="ghost" className="text-gt-gold hover:bg-gt-gold/10 hover:text-gt-gold whitespace-nowrap">
            <Link to="/upload">Upload</Link>
          </Button>
          <ThemeToggle />
          <AuthButtons />
        </div>
      </div>

      {/* Mobile (< md) */}
      <div className="md:hidden px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gt-gold hover:text-gt-gold/90 whitespace-nowrap">
            GT Notes
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" variant="ghost" className="text-gt-gold hover:bg-gt-gold/10 hover:text-gt-gold">
              <Link to="/upload">Upload</Link>
            </Button>
            <ThemeToggle />
            <AuthButtons />
          </div>
        </div>
        <div className="mt-3">
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search notes, professors, classes..."
              value={inputValue}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-8 py-2 rounded-md border border-input focus:ring-gt-gold focus:border-gt-gold bg-background"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            {inputValue ? (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

function AuthButtons() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await getSession();
        if (session) {
          setIsAuthed(true);
          setUser(session.user);
          setIsAdmin(session.user?.role === "admin");
        } else {
          setIsAuthed(false);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuthed(false);
        setUser(null);
        setIsAdmin(false);
      }
    };

    checkAuth();
    
    // Check auth status periodically
    const interval = setInterval(checkAuth, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthed(false);
      setUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (isAuthed) {
    return (
      <div className="flex items-center space-x-2">
        {isAdmin && (
          <Button
            asChild
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            <Link to="/admin">Admin</Link>
          </Button>
        )}
        <Button
          asChild
          className="bg-gt-gold text-gt-gold-foreground hover:bg-gt-gold/90"
        >
          <Link to="/profile">Profile</Link>
        </Button>
        <Button
          onClick={handleSignOut}
          variant="outline"
          className="text-muted-foreground hover:text-foreground"
        >
          Sign Out
        </Button>
      </div>
    );
  }
  
  return (
    <Button className="bg-gt-gold text-gt-gold-foreground hover:bg-gt-gold/90">
      <Link to="/sign-in">Sign In</Link>
    </Button>
  );
}
