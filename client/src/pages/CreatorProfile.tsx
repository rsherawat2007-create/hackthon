import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { MatchBadge } from "@/components/MatchBadge";
import { SendBriefModal } from "@/components/SendBriefModal";
import { TrustSignals } from "@/components/TrustSignals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import type { Creator } from "@/types";

export function CreatorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [sendOpen, setSendOpen] = useState(false);

  useEffect(() => {
    api<{ creator: Creator }>(`/api/creators/${id}?keyword=AI%20product%20video&tool=Runway&specialization=Product%20Advertisement&contentType=AI%20Video`)
      .then((d) => setCreator(d.creator))
      .catch((e) => toast.error(e.message));
  }, [id]);

  if (!creator) return <div className="p-10 text-center text-ink/50">Loading profile…</div>;

  async function shortlist() {
    try {
      await api("/api/shortlist", { method: "POST", body: JSON.stringify({ creatorId: creator.id }) });
      toast.success("Shortlisted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not shortlist");
    }
  }

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-end">
          <img src={creator.avatarUrl} alt="" className="h-28 w-28 rounded-3xl object-cover" />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">{creator.specializations.join(" · ")}</p>
            <h1 className="font-display text-5xl">{creator.user.name}</h1>
            <p className="mt-2 text-white/70">{creator.headline}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <MatchBadge match={creator.match} />
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs">Trust {creator.trustScore}</span>
            </div>
          </div>
          {user?.role === "BRAND" && (
            <div className="flex gap-2">
              <Button onClick={shortlist}>Shortlist Creator</Button>
              <Button variant="accent" onClick={() => setSendOpen(true)}>
                Send Brief
              </Button>
            </div>
          )}
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-display text-3xl">About</h2>
            <p className="mt-3 text-ink/70">{creator.bio}</p>
            <p className="mt-3 text-sm text-ink/50">
              {creator.location} · {creator.experience}
            </p>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-3xl">Skills</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {creator.skills.map((s) => (
                <span key={s} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-3xl">AI tools & models</h2>
            <p className="mt-3 text-sm">{creator.tools.join(" · ")}</p>
            <p className="mt-1 text-sm text-ink/50">Models: {creator.aiModels.join(", ")}</p>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-3xl">Workflow</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/70">{creator.workflow}</p>
          </Card>
          <Card className="p-6" id="portfolio">
            <h2 className="font-display text-3xl">Portfolio</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {creator.portfolio.map((p) => (
                <Link key={p.id} to={`/portfolio/${p.id}`} className="overflow-hidden rounded-2xl bg-mist">
                  <img src={p.thumbnailUrl} alt="" className="h-40 w-full object-cover" />
                  <div className="p-3">
                    <p className="font-semibold">{p.title}</p>
                    <p className="text-xs text-ink/50">
                      {p.contentType} · {p.aspectRatio}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <h2 className="font-display text-3xl">Commercial use</h2>
            <p className="mt-3 text-sm text-ink/70">{creator.commercialUse ? "Available for commercial campaigns." : "Not available for commercial use."}</p>
            <p className="mt-2 text-sm text-ink/60">{creator.commercialNotes}</p>
          </Card>
        </div>
        <div className="space-y-4">
          <Card className="p-5">
            <TrustSignals verification={creator.verification} trustScore={creator.trustScore} />
          </Card>
          {creator.match && (
            <Card className="space-y-2 p-5 text-sm">
              <p className="font-semibold">Match breakdown</p>
              {[
                ["Skill", creator.match.skill, 35],
                ["Specialization", creator.match.specialization, 20],
                ["Tool", creator.match.tool, 15],
                ["Content type", creator.match.contentType, 15],
                ["Portfolio", creator.match.portfolio, 10],
                ["Trust", creator.match.verification, 5],
              ].map(([label, got, max]) => (
                <div key={String(label)} className="flex justify-between">
                  <span>{label}</span>
                  <span>
                    {got}/{max}
                  </span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
      <SendBriefModal open={sendOpen} onClose={() => setSendOpen(false)} creatorId={creator.id} creatorName={creator.user.name} />
    </div>
  );
}
