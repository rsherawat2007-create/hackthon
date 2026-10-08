import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("apex@creatorhub.ai");
  const [password, setPassword] = useState("DemoPass123!");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success("Welcome back");
      navigate(user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/brand");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <Card className="p-8">
        <h1 className="font-display text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-ink/60">Demo brand: apex@creatorhub.ai · DemoPass123!</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
          <Button type="submit" variant="accent" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-sm">
          New here? <Link to="/register" className="font-semibold text-accent">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
