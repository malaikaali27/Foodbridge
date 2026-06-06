import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Impact — FoodBridge meals rescued for SDG 2 & 12" },
      { name: "description", content: "FoodBridge community impact: meals rescued, partner NGOs, CO₂ saved through redistribution." },
      { property: "og:title", content: "FoodBridge community impact" },
      { property: "og:description", content: "Meals rescued, partner NGOs and CO₂ avoided." },
    ],
  }),
  component: Impact,
});

function Impact() {
  const stats = [
    { k: "12,480", v: "Meals rescued" },
    { k: "340", v: "Active donors" },
    { k: "68", v: "Partner NGOs" },
    { k: "9.4 t", v: "CO₂e avoided" },
  ];
  return (
    <div className="min-h-screen bg-background bg-grain">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-20">
        <span className="text-xs uppercase tracking-widest text-primary">SDG 2 · SDG 12</span>
        <h1 className="mt-3 font-display text-5xl font-semibold md:text-6xl">Impact, in real numbers.</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Every donation logged feeds a measurable contribution toward Zero Hunger and Responsible Consumption.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.v} className="rounded-2xl border border-border bg-card p-8 shadow-soft">
              <p className="font-display text-5xl font-semibold text-gradient-forest">{s.k}</p>
              <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl gradient-forest p-12 text-primary-foreground">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">A community-built ledger of generosity.</h2>
          <p className="mt-4 max-w-2xl text-primary-foreground/85">
            Live analytics dashboards roll up to monthly impact reports, shared with city partners, donors and the public.
          </p>
        </div>
      </main>
    </div>
  );
}
