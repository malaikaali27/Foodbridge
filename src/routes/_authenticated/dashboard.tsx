import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Plus, Package, CheckCircle2, Clock, Truck, ShieldCheck, HandHeart, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
});

type Donation = {
  id: string;
  title: string;
  food_type: string;
  quantity: number;
  unit: string;
  pickup_address: string;
  expiry_at: string;
  status: string;
  donor_id: string;
  accepted_by: string | null;
  created_at: string;
};

type RoleKey = "donor" | "ngo" | "volunteer" | "admin";

const ROLE_META: Record<RoleKey, { label: string; tagline: string; icon: typeof Package }> = {
  donor: { label: "Donor", tagline: "Share your surplus food with people who need it.", icon: HandHeart },
  ngo: { label: "NGO Partner", tagline: "Coordinate pickups and deliver meals to your community.", icon: Users },
  volunteer: { label: "Volunteer", tagline: "Accept pickups and complete deliveries on the ground.", icon: Truck },
  admin: { label: "Admin", tagline: "Oversee the entire FoodBridge platform.", icon: ShieldCheck },
};

function pickPrimaryRole(roles: RoleKey[]): RoleKey {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("ngo")) return "ngo";
  return "donor";
}

function Dashboard() {
  const { user, roles } = useAuth();
  const primary = pickPrimaryRole(roles as RoleKey[]);
  const meta = ROLE_META[primary];
  const isDonor = primary === "donor";
  const isPickupRole = roles.includes("ngo") || roles.includes("admin");
  const isAdmin = roles.includes("admin");

  const [mine, setMine] = useState<Donation[]>([]);
  const [available, setAvailable] = useState<Donation[]>([]);
  const [accepted, setAccepted] = useState<Donation[]>([]);

  useEffect(() => {
    if (!user) return;
    void load();
    const ch = supabase
      .channel("donations-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "donations" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  async function load() {
    if (!user) return;
    const [{ data: m }, { data: a }, { data: ac }] = await Promise.all([
      supabase.from("donations").select("*").eq("donor_id", user.id).order("created_at", { ascending: false }),
      supabase.from("donations").select("*").eq("status", "available").order("expiry_at", { ascending: true }).limit(20),
      supabase.from("donations").select("*").eq("accepted_by", user.id).order("accepted_at", { ascending: false }).limit(20),
    ]);
    setMine((m ?? []) as Donation[]);
    setAvailable((a ?? []) as Donation[]);
    setAccepted((ac ?? []) as Donation[]);
  }

  async function accept(id: string) {
    const { error } = await supabase.from("donations").update({
      status: "accepted",
      accepted_by: user!.id,
      accepted_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Pickup accepted");
  }

  async function markPickedUp(id: string) {
    const { error } = await supabase.from("donations").update({ status: "picked_up" }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Marked picked up");
  }

  async function markDelivered(id: string) {
    const { error } = await supabase.from("donations").update({
      status: "delivered",
      completed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error(error.message); else toast.success("Marked delivered");
  }

  async function deleteMine(id: string) {
    if (!confirm("Delete this donation post?")) return;
    const { error } = await supabase.from("donations").delete().eq("id", id);
    if (error) toast.error(error.message); else toast.success("Deleted");
  }

  const Icon = meta.icon;

  // Stats vary by role
  const donorStats = [
    { label: "My donations", value: mine.length, icon: Package },
    { label: "Delivered", value: mine.filter((d) => d.status === "delivered").length, icon: CheckCircle2 },
    { label: "In progress", value: mine.filter((d) => ["accepted", "picked_up"].includes(d.status)).length, icon: Truck },
  ];
  const pickupStats = [
    { label: "Available now", value: available.length, icon: Clock },
    { label: "My active pickups", value: accepted.filter((d) => d.status !== "delivered").length, icon: Truck },
    { label: "Completed by me", value: accepted.filter((d) => d.status === "delivered").length, icon: CheckCircle2 },
  ];
  const stats = primary === "donor" ? donorStats : pickupStats;

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary">
            <Icon className="h-3.5 w-3.5" /> {meta.label} dashboard
          </div>
          <h1 className="mt-1 font-display text-4xl font-semibold">{user?.email}</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{meta.tagline}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {(roles as RoleKey[]).map((r) => (
              <span key={r} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">{r}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isDonor && (
            <Button asChild className="gradient-forest border-0">
              <Link to="/donate"><Plus className="mr-1 h-4 w-4" /> Post donation</Link>
            </Button>
          )}
          {isAdmin && (
            <Button asChild variant="outline">
              <Link to="/admin"><ShieldCheck className="mr-1 h-4 w-4" /> Admin console</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary-glow" />
            </div>
            <p className="mt-3 font-display text-4xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* NGO / Volunteer / Admin: available pickups */}
      {isPickupRole && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">Available pickups · sorted by expiry</h2>
          <p className="text-sm text-muted-foreground">Accept a donation to coordinate pickup and delivery.</p>
          <div className="mt-4 grid gap-4">
            {available.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                No available donations right now. Check back soon.
              </p>
            )}
            {available.map((d) => (
              <DonationCard key={d.id} d={d}
                actions={d.donor_id !== user!.id
                  ? <Button size="sm" onClick={() => accept(d.id)} className="gradient-forest border-0">Accept pickup</Button>
                  : <span className="text-xs text-muted-foreground">Your own post</span>}
              />
            ))}
          </div>
        </section>
      )}

      {/* NGO / Volunteer / Admin: my accepted pickups */}
      {isPickupRole && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">My pickups</h2>
          <div className="mt-4 grid gap-4">
            {accepted.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                You haven't accepted any pickups yet.
              </p>
            )}
            {accepted.map((d) => (
              <DonationCard key={d.id} d={d}
                actions={
                  d.status === "accepted" ? (
                    <Button size="sm" variant="outline" onClick={() => markPickedUp(d.id)}><Truck className="mr-1 h-3 w-3" /> Mark picked up</Button>
                  ) : d.status === "picked_up" ? (
                    <Button size="sm" className="gradient-forest border-0" onClick={() => markDelivered(d.id)}><CheckCircle2 className="mr-1 h-3 w-3" /> Mark delivered</Button>
                  ) : null
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Donor: my posted donations */}
      {isDonor && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-semibold">My posted donations</h2>
          <div className="mt-4 grid gap-4">
            {mine.length === 0 && (
              <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                You haven't posted anything yet. <Link to="/donate" className="font-medium text-primary underline">Post your first donation</Link>.
              </p>
            )}
            {mine.map((d) => (
              <DonationCard key={d.id} d={d}
                actions={
                  <div className="flex gap-2">
                    {d.status === "picked_up" && (
                      <Button size="sm" variant="outline" onClick={() => markDelivered(d.id)}><Truck className="mr-1 h-3 w-3" /> Mark delivered</Button>
                    )}
                    {d.status === "available" && (
                      <Button size="sm" variant="ghost" onClick={() => deleteMine(d.id)}>Delete</Button>
                    )}
                  </div>
                }
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function DonationCard({ d, actions }: { d: Donation; actions?: React.ReactNode }) {
  const expiringSoon = new Date(d.expiry_at).getTime() - Date.now() < 1000 * 60 * 60 * 3;
  const statusColors: Record<string, string> = {
    available: "bg-primary/10 text-primary",
    accepted: "bg-accent/30 text-accent-foreground",
    picked_up: "bg-accent/40 text-accent-foreground",
    delivered: "bg-primary text-primary-foreground",
    expired: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
  };
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${statusColors[d.status] ?? ""}`}>{d.status}</span>
          {expiringSoon && d.status === "available" && (
            <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">Expiring soon</span>
          )}
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold">{d.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {d.quantity} {d.unit} · {d.food_type} · {d.pickup_address}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Expires {formatDistanceToNow(new Date(d.expiry_at), { addSuffix: true })}
        </p>
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}
