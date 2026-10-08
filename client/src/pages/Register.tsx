import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>((params.get("role") as Role) || "BRAND");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    setLoading(true);
    try {
      const user = await register({ name, email, password, role });
      toast.success("Account created");
      navigate(user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/brand");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not register");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="font-display text-4xl">Join CreatorHub</h1>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {(["BRAND", "CREATOR"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${role === r ? "border-accent bg-violet-50" : "border-ink/10"}`}
            >
              {r === "BRAND" ? "Brand / Agency" : "AI Creator"}
            </button>
          ))}
        </div>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" required />
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          Already have an account? <Link to="/login" className="font-semibold text-accent">Login</Link>
        </p>
      </Card>
    </div>
  );
}
