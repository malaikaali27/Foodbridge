import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function SiteHeader() {
  const { user, roles, signOut } = useAuth();
  const isAdmin = roles.includes("admin");
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-forest text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">FoodBridge</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/" className="hover:text-foreground transition">Home</Link>
          <Link to="/how-it-works" className="hover:text-foreground transition">How it works</Link>
          <Link to="/impact" className="hover:text-foreground transition">Impact</Link>
          {user && <Link to="/dashboard" className="hover:text-foreground transition">Dashboard</Link>}
          {isAdmin && <Link to="/admin" className="hover:text-foreground transition">Admin</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/dashboard">Dashboard</Link></Button>
              <Button size="sm" variant="outline" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm" className="gradient-forest border-0">
                <Link to="/auth">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
