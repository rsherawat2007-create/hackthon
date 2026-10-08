import { Link, NavLink, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dash = user?.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/brand";

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-ink text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          CreatorHub <span className="text-accent">AI</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-ink/70 md:flex">
          <NavLink to="/creators">Find creators</NavLink>
          <NavLink to="/ai-brief-builder">AI Brief Builder</NavLink>
          {user?.role === "BRAND" && <NavLink to="/briefs">Briefs</NavLink>}
          {user?.role === "BRAND" && <NavLink to="/shortlist">Shortlist</NavLink>}
          {user && <NavLink to="/engagements">Engagements</NavLink>}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button size="sm" variant="outline" onClick={() => navigate(dash)}>
                Dashboard
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" variant="accent" asChild>
                <Link to="/register">Join</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
