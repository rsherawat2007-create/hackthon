import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import type { Brief } from "@/types";

export function BriefsPage() {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  useEffect(() => {
    api<{ briefs: Brief[] }>("/api/briefs").then((d) => setBriefs(d.briefs));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-end justify-between">
        <h1 className="font-display text-5xl">Creative briefs</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/briefs/new">Manual brief</Link>
          </Button>
          <Button variant="accent" asChild>
            <Link to="/ai-brief-builder">AI Brief Builder</Link>
          </Button>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {briefs.length === 0 && <Card className="p-10 text-center text-ink/50">No briefs yet. Generate one with the AI Brief Builder.</Card>}
        {briefs.map((b) => (
          <Link key={b.id} to={`/briefs/${b.id}`}>
            <Card className="mb-3 p-5 hover:bg-mist">
              <p className="font-semibold">{b.title}</p>
              <p className="text-sm text-ink/60">
                {b.contentType} · {b.platform} · {b.aspectRatio} · {b.commercialUse ? "Commercial" : "Non-commercial"}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
