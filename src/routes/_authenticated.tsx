import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center text-muted-foreground">Loading…</div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-grain">
      <SiteHeader />
      <Outlet />
    </div>
  );
}
