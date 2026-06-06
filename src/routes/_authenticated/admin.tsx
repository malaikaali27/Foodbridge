import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, CheckCircle2, ShieldCheck, Users, Package, TrendingUp, Clock } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminPage,
});

type Profile = { id: string; full_name: string | null; organization: string | null; phone: string | null; approved: boolean; created_at: string };
type RoleRow = { id: string; user_id: string; role: string };
type Donation = { id: string; title: string; food_type: string; quantity: number; unit: string; status: string; donor_id: string; expiry_at: string; created_at: string };

function AdminPage() {
  const { user, roles, loading } = useAuth();
  const navigate = useNavigate();
  const isAdmin = roles.includes("admin");

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roleRows, setRoleRows] = useState<RoleRow[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/dashboard" });
  }, [loading, isAdmin, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    void loadAll();
    const ch = supabase
      .channel("admin-feed")
      .on("postgres_changes", { event: "*", schema: "public" }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin]);

  async function loadAll() {
    const [{ data: p }, { data: r }, { data: d }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
      supabase.from("donations").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    setProfiles((p ?? []) as Profile[]);
    setRoleRows((r ?? []) as RoleRow[]);
    setDonations((d ?? []) as Donation[]);
  }

  async function approve(id: string) {
    const { error } = await supabase.from("profiles").update({ approved: true }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("User approved");
  }
  async function unapprove(id: string) {
    const { error } = await supabase.from("profiles").update({ approved: false }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Approval revoked");
  }
  async function deleteDonation(id: string) {
    if (!confirm("Remove this donation post?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Post removed");
  }
  async function setRole(userId: string, role: "donor" | "ngo" | "admin") {
    const existing = roleRows.find((r) => r.user_id === userId && r.role === role);
    if (existing) { toast.info("User already has that role"); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message); else toast.success(`Granted ${role}`);
  }
  async function removeRole(rowId: string) {
    const { error } = await supabase.from("user_roles").delete().eq("id", rowId);
    if (error) toast.error(error.message); else toast.success("Role removed");
  }

  if (!isAdmin) return null;

  // Analytics
  const totalDonations = donations.length;
  const delivered = donations.filter((d) => d.status === "delivered").length;
  const available = donations.filter((d) => d.status === "available").length;
  const pendingApprovals = profiles.filter((p) => !p.approved).length;
  const stats = [
    { label: "Total users", value: profiles.length, icon: Users },
    { label: "Pending approvals", value: pendingApprovals, icon: ShieldCheck },
    { label: "Total donations", value: totalDonations, icon: Package },
    { label: "Delivered meals", value: delivered, icon: CheckCircle2 },
    { label: "Currently available", value: available, icon: Clock },
    { label: "Conversion rate", value: totalDonations ? `${Math.round((delivered / totalDonations) * 100)}%` : "—", icon: TrendingUp },
  ];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-primary">Admin console</p>
          <h1 className="mt-1 font-display text-4xl font-semibold">Platform overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Approvals, role management and content moderation.</p>
        </div>
        <Button asChild variant="outline"><Link to="/dashboard">My dashboard</Link></Button>
      </div>

      {/* Analytics */}
      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs uppercase tracking-wider">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary-glow" />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pending approvals */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Pending approvals</h2>
        <div className="mt-4 grid gap-3">
          {profiles.filter((p) => !p.approved).length === 0 && (
            <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">No pending approvals.</p>
          )}
          {profiles.filter((p) => !p.approved).map((p) => (
            <UserRow key={p.id} p={p} roleRows={roleRows} onApprove={() => approve(p.id)} onUnapprove={() => unapprove(p.id)} onSetRole={(r) => setRole(p.id, r)} onRemoveRole={removeRole} />
          ))}
        </div>
      </section>

      {/* All users */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">All users</h2>
        <div className="mt-4 grid gap-3">
          {profiles.map((p) => (
            <UserRow key={p.id} p={p} roleRows={roleRows} onApprove={() => approve(p.id)} onUnapprove={() => unapprove(p.id)} onSetRole={(r) => setRole(p.id, r)} onRemoveRole={removeRole} highlightSelf={p.id === user?.id} />
          ))}
        </div>
      </section>

      {/* Donations moderation */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-semibold">Recent donations · moderation</h2>
        <div className="mt-4 grid gap-3">
          {donations.map((d) => (
            <div key={d.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2 py-0.5">{d.status}</span>
                  <span>{d.food_type}</span>
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold">{d.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{d.quantity} {d.unit}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => deleteDonation(d.id)}>
                <Trash2 className="mr-1 h-3 w-3" /> Remove post
              </Button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function UserRow({
  p, roleRows, onApprove, onUnapprove, onSetRole, onRemoveRole, highlightSelf,
}: {
  p: Profile;
  roleRows: RoleRow[];
  onApprove: () => void;
  onUnapprove: () => void;
  onSetRole: (r: "donor" | "ngo" | "admin") => void;
  onRemoveRole: (rowId: string) => void;
  highlightSelf?: boolean;
}) {
  const userRoles = roleRows.filter((r) => r.user_id === p.id);
  return (
    <div className={`rounded-2xl border bg-card p-5 shadow-soft ${highlightSelf ? "border-primary" : "border-border"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold">{p.full_name || "Unnamed user"}</h3>
            {p.approved ? (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">Approved</span>
            ) : (
              <span className="rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground">Pending</span>
            )}
            {highlightSelf && <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">You</span>}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{p.organization || "—"} {p.phone ? `· ${p.phone}` : ""}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {userRoles.map((r) => (
              <button key={r.id} onClick={() => onRemoveRole(r.id)} className="group rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium hover:border-destructive hover:text-destructive">
                {r.role} <span className="opacity-0 group-hover:opacity-100">×</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {p.approved ? (
            <Button size="sm" variant="outline" onClick={onUnapprove}>Revoke</Button>
          ) : (
            <Button size="sm" className="gradient-forest border-0" onClick={onApprove}>Approve</Button>
          )}
          {(["donor", "ngo", "admin"] as const).map((r) => (
            <Button key={r} size="sm" variant="ghost" className="text-xs" onClick={() => onSetRole(r)}>+{r}</Button>
          ))}
        </div>
      </div>
    </div>
  );
}
