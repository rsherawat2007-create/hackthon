import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/services/api";
import type { PortfolioItem } from "@/types";
import { Card } from "@/components/ui/card";

export function PortfolioDetail() {
  const { id } = useParams();
  const [item, setItem] = useState<(PortfolioItem & { creator: { id: string; user: { name: string }; workflow: string } }) | null>(null);

  useEffect(() => {
    api<{ item: typeof item }>(`/api/portfolio/item/${id}`).then((d) => setItem(d.item));
  }, [id]);

  if (!item) return <div className="p-10 text-center">Loading project…</div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <img src={item.mediaUrl} alt="" className="h-[420px] w-full rounded-[2rem] object-cover" />
      <div className="mt-8 grid gap-6 md:grid-cols-[1.4fr_0.6fr]">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/40">{item.category}</p>
          <h1 className="font-display text-5xl">{item.title}</h1>
          <p className="mt-4 text-ink/70">{item.description}</p>
          <Card className="mt-6 p-5">
            <h2 className="font-semibold">Workflow</h2>
            <p className="mt-2 text-sm text-ink/70">{item.workflow || item.creator.workflow}</p>
          </Card>
        </div>
        <Card className="space-y-3 p-5 text-sm">
          <p>
            <strong>Content type:</strong> {item.contentType}
          </p>
          <p>
            <strong>Aspect ratio:</strong> {item.aspectRatio}
          </p>
          <p>
            <strong>Commercial use:</strong> {item.commercialUse ? "Yes" : "No"}
          </p>
          <p>
            <strong>Tools:</strong> {item.toolsUsed.join(", ")}
          </p>
          <p>
            <strong>Models:</strong> {item.aiModelsUsed.join(", ")}
          </p>
          <p>
            <strong>Skills:</strong> {item.skills.join(", ")}
          </p>
          <Link to={`/creators/${item.creatorId}`} className="block pt-2 font-semibold text-accent">
            Creator: {item.creator.user.name}
          </Link>
        </Card>
      </div>
    </div>
  );
}
