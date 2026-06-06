import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { ArrowRight, Apple, Truck, Users, Sparkles, Clock, MapPin } from "lucide-react";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background bg-grain">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-16 pb-24 md:grid-cols-12 md:pt-24">
          <div className="md:col-span-7 flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-cream px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3 text-primary-glow" /> SDG 2 · Zero Hunger · SDG 12 · Responsible Consumption
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
              Rescue food.
              <br />
              <span className="text-gradient-forest">Feed neighborhoods.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              FoodBridge connects restaurants, hotels and grocers with NGOs and
              volunteers in real time — so surplus meals reach hungry communities
              before the clock runs out.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gradient-forest border-0 shadow-soft">
                <Link to="/auth">Donate surplus food <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/auth">Join as NGO / Volunteer</Link>
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-8 max-w-lg">
              {[
                ["12k+", "Meals rescued"],
                ["340", "Active donors"],
                ["68", "Partner NGOs"],
              ].map(([k, v]) => (
                <div key={v}>
                  <dt className="font-display text-3xl font-semibold text-foreground">{k}</dt>
                  <dd className="text-xs uppercase tracking-wider text-muted-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="md:col-span-5 relative">
            <div className="relative overflow-hidden rounded-3xl shadow-soft ring-1 ring-border">
              <img src={heroImg} alt="Volunteers distributing rescued food at golden hour" width={1600} height={1200} className="h-full w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-background/95 p-4 backdrop-blur">
                <div className="flex items-center gap-3 text-sm">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground"><Clock className="h-4 w-4" /></span>
                  <div>
                    <p className="font-medium">38 meals · expires in 2h</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Café Rosa · 0.8 km away</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three-step */}
      <section className="border-y border-border bg-cream">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-display text-3xl font-semibold md:text-4xl">A bridge in three steps</h2>
          <p className="mt-2 max-w-xl text-muted-foreground">From surplus tray to community plate — usually in under 90 minutes.</p>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Apple, title: "Donors post", body: "Restaurants, hotels and grocers list surplus food with quantity, expiry and pickup window." },
              { icon: Users, title: "NGOs accept", body: "Verified NGOs and volunteers see real-time alerts sorted by expiry and proximity." },
              { icon: Truck, title: "Volunteers deliver", body: "Pickups are assigned, tracked and completed — every meal logged for impact reporting." },
            ].map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-7 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl gradient-forest text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-5xl font-bold text-muted-foreground/30">0{i + 1}</span>
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="relative overflow-hidden rounded-3xl gradient-forest p-12 text-primary-foreground md:p-16">
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-display text-4xl font-semibold md:text-5xl">A meal saved is a life touched.</h2>
            <p className="mt-4 text-primary-foreground/85">
              Join FoodBridge and turn your surplus into someone's dinner tonight.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-8">
              <Link to="/auth">Create your account <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-accent/40 blur-3xl" />
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FoodBridge · Built for SDG 2 & 12</p>
          <p>Made with care for hungry communities.</p>
        </div>
      </footer>
    </div>
  );
}
