import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Leaf } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const signupSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(6).max(72),
  full_name: z.string().trim().min(1).max(100),
  organization: z.string().trim().max(120).optional(),
  role: z.enum(["donor", "ngo"]),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background bg-grain">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-10 md:grid-cols-2">
        <div className="hidden md:block">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl gradient-forest text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-display text-2xl font-semibold">FoodBridge</span>
          </Link>
          <h1 className="mt-12 font-display text-5xl font-semibold leading-tight">
            Every meal saved is a <span className="text-gradient-forest">small revolution.</span>
          </h1>
          <p className="mt-6 max-w-md text-muted-foreground">
            Sign in to post surplus food, accept pickups, or coordinate volunteer drops in your area.
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft md:p-10">
          <Tabs defaultValue="signin">
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="signin"><SignInForm /></TabsContent>
            <TabsContent value="signup"><SignUpForm /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Welcome back!");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading} className="w-full gradient-forest border-0">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

function SignUpForm() {
  const [form, setForm] = useState({ email: "", password: "", full_name: "", organization: "", role: "donor" as const });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: form.full_name,
          organization: form.organization,
          role: form.role,
        },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created! Check your email to verify.");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>I am joining as</Label>
        <RadioGroup
          value={form.role}
          onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}
          className="grid grid-cols-2 gap-2"
        >
          {(["donor", "ngo"] as const).map((r) => (
            <Label
              key={r}
              htmlFor={`r-${r}`}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl border border-border bg-cream p-3 text-xs font-medium uppercase tracking-wider hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <RadioGroupItem id={`r-${r}`} value={r} className="sr-only" />
              {r}
            </Label>
          ))}
        </RadioGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="org">Organization (optional)</Label>
        <Input id="org" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-email">Email</Label>
        <Input id="su-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="su-pw">Password</Label>
        <Input id="su-pw" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      </div>
      <Button type="submit" disabled={loading} className="w-full gradient-forest border-0">
        {loading ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}
