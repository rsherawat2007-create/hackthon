import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import type { Brief } from "@/types";

export function BriefDetail() {
  const { id } = useParams();
  const [brief, setBrief] = useState<Brief | null>(null);
  useEffect(() => {
    api<{ brief: Brief }>(`/api/briefs/${id}`).then((d) => setBrief(d.brief));
  }, [id]);
  if (!brief) return <div className="p-10 text-center">Loading brief…</div>;
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs uppercase tracking-widest text-ink/40">{brief.platform} · {brief.aspectRatio}</p>
      <h1 className="font-display text-5xl">{brief.title}</h1>
      <p className="mt-4 text-ink/70">{brief.description}</p>
      <Card className="mt-6 grid gap-2 p-6 text-sm">
        <p><strong>Content:</strong> {brief.contentType}</p>
        <p><strong>Style:</strong> {brief.style}</p>
        <p><strong>Audience:</strong> {brief.targetAudience}</p>
        <p><strong>Duration:</strong> {brief.duration}</p>
        <p><strong>Tools:</strong> {brief.requiredTools.join(", ")}</p>
        <p><strong>Skills:</strong> {brief.requiredSkills.join(", ")}</p>
        <p><strong>Commercial use:</strong> {brief.commercialUse ? "Yes" : "No"}</p>
        <p><strong>Budget:</strong> {brief.budget}</p>
        <p><strong>Deliverables:</strong> {brief.deliverables.join(", ")}</p>
        <p><strong>Direction:</strong> {brief.creativeDirection}</p>
      </Card>
      <Button className="mt-6" variant="accent" asChild>
        <Link to={`/creators?keyword=${encodeURIComponent(brief.title)}&tool=${encodeURIComponent(brief.requiredTools[0] || "")}&contentType=${encodeURIComponent(brief.contentType)}`}>
          Find matching creators
        </Link>
      </Button>
    </div>
  );
}
