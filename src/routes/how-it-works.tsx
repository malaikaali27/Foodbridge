import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Apple, Bell, MapPin, Truck, Users, ChartBar } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How FoodBridge works — donate, pickup, deliver" },
      { name: "description", content: "Step by step: donors post surplus food, NGOs accept pickups, volunteers deliver to communities — all in real time." },
      { property: "og:title", content: "How FoodBridge works" },
      { property: "og:description", content: "Real-time donation flow from kitchen to community." },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const steps = [
    { icon: Apple, title: "Post surplus food", body: "Donors add quantity, expiry window, pickup address and an optional photo. Edits and cancellations happen in seconds." },
    { icon: Bell, title: "Real-time alerts", body: "Available donations are pushed to NGOs and volunteers instantly via realtime channels — sorted by expiry urgency." },
    { icon: MapPin, title: "Geo-aware matching", body: "Pickup addresses surface to nearby teams first, reducing travel time and food spoilage." },
    { icon: Users, title: "Volunteer assignment", body: "An NGO accepts a donation, then assigns a volunteer to do the pickup and the drop-off." },
    { icon: Truck, title: "Track to delivery", body: "Status moves from accepted → picked up → delivered, with timestamps and acknowledgement." },
    { icon: ChartBar, title: "Impact analytics", body: "Every meal logged feeds a public impact dashboard for SDG 2 & 12 reporting." },
  ];
  return (
    <div className="min-h-screen bg-background bg-grain">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <h1 className="font-display text-5xl font-semibold md:text-6xl">How FoodBridge works</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          From a kitchen tray to a community plate — the entire flow runs on a single, live platform.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-forest text-primary-foreground">
                  <s.icon className="h-5 w-5" />
                </span>
                <span className="font-display text-4xl font-bold text-muted-foreground/30">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
