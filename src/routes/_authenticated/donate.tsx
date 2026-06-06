import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_authenticated/donate")({
  component: DonatePage,
});

const schema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(1000).optional(),
  food_type: z.string().trim().min(2).max(60),
  quantity: z.number().positive().max(100000),
  unit: z.string().trim().min(1).max(30),
  pickup_address: z.string().trim().min(3).max(255),
  expiry_at: z.string().min(1),
});

function DonatePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    food_type: "Cooked meals",
    quantity: 10,
    unit: "servings",
    pickup_address: "",
    expiry_at: defaultExpiry(),
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("donations").insert({
      ...parsed.data,
      donor_id: user!.id,
      expiry_at: new Date(parsed.data.expiry_at).toISOString(),
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Donation posted! NGOs nearby are notified.");
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-4xl font-semibold">Post a donation</h1>
      <p className="mt-2 text-muted-foreground">
        Add details so volunteers can collect quickly. Tip: include packaging notes.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="38 vegetable curry servings" />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ft">Food type</Label>
            <Input id="ft" required value={form.food_type} onChange={(e) => setForm({ ...form, food_type: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex gap-2">
              <Input type="number" min={1} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
              <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-32" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addr">Pickup address</Label>
          <Input id="addr" required value={form.pickup_address} onChange={(e) => setForm({ ...form, pickup_address: e.target.value })} placeholder="221 Baker St, kitchen entrance" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exp">Expires at</Label>
          <Input id="exp" type="datetime-local" required value={form.expiry_at} onChange={(e) => setForm({ ...form, expiry_at: e.target.value })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="desc">Notes (optional)</Label>
          <Textarea id="desc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Vegetarian, mildly spiced, packed in foil trays." />
        </div>

        <Button type="submit" disabled={loading} className="w-full gradient-forest border-0">
          {loading ? "Posting…" : "Post donation"}
        </Button>
      </form>
    </main>
  );
}

function defaultExpiry() {
  const d = new Date(Date.now() + 1000 * 60 * 60 * 4);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}
