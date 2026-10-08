import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import type { Engagement, EngagementStatus } from "@/types";

export function EngagementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Engagement[]>([]);

  async function load() {
    const d = await api<{ engagements: Engagement[] }>("/api/engagements");
    setItems(d.engagements);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: EngagementStatus) {
    try {
      await api(`/api/engagements/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      toast.success(`Status: ${status}`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-5xl">Engagements</h1>
      <div className="mt-6 space-y-3">
        {items.length === 0 && <Card className="p-10 text-center text-ink/50">No engagements yet.</Card>}
        {items.map((e) => (
          <Card key={e.id} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold">{e.brief.title}</p>
                <p className="text-sm text-ink/60">
                  {e.brand.companyName} → {e.creator.user.name}
                </p>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold uppercase">{e.status}</span>
            </div>
            {user?.role === "CREATOR" && e.status === "PENDING" && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="accent" onClick={() => setStatus(e.id, "ACCEPTED")}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => setStatus(e.id, "REJECTED")}>
                  Reject
                </Button>
              </div>
            )}
            {user?.role === "CREATOR" && e.status === "ACCEPTED" && (
              <Button size="sm" className="mt-3" onClick={() => setStatus(e.id, "IN_PROGRESS")}>
                Mark in progress
              </Button>
            )}
            {e.status === "IN_PROGRESS" && (
              <Button size="sm" className="mt-3" onClick={() => setStatus(e.id, "COMPLETED")}>
                Mark completed
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
