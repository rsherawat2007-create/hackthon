import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CreatorCard } from "@/components/CreatorCard";
import { SendBriefModal } from "@/components/SendBriefModal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { CONTENT_TYPES, SPECIALIZATIONS, TOOLS, type Creator } from "@/types";

export function CreatorsSearch() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [keyword, setKeyword] = useState(params.get("keyword") || params.get("q") || "AI product video");
  const [skill, setSkill] = useState(params.get("skill") || "");
  const [specialization, setSpecialization] = useState(params.get("specialization") || "Product Advertisement");
  const [tool, setTool] = useState(params.get("tool") || "Runway");
  const [contentType, setContentType] = useState(params.get("contentType") || "AI Video");
  const [commercialUse, setCommercialUse] = useState(params.get("commercialUse") || "true");
  const [experience, setExperience] = useState(params.get("experience") || "");
  const [results, setResults] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set());
  const [sendTo, setSendTo] = useState<Creator | null>(null);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    if (keyword) q.set("keyword", keyword);
    if (skill) q.set("skill", skill);
    if (specialization) q.set("specialization", specialization);
    if (tool) q.set("tool", tool);
    if (contentType) q.set("contentType", contentType);
    if (commercialUse) q.set("commercialUse", commercialUse);
    if (experience) q.set("experience", experience);
    return q.toString();
  }, [keyword, skill, specialization, tool, contentType, commercialUse, experience]);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      setParams(new URLSearchParams(query), { replace: true });
      try {
        const data = await api<{ results: Creator[] }>(`/api/creators/search?${query}`);
        setResults(data.results);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Search failed");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, setParams]);

  async function shortlist(id: string) {
    if (user?.role !== "BRAND") return toast.error("Login as a brand to shortlist");
    try {
      await api("/api/shortlist", { method: "POST", body: JSON.stringify({ creatorId: id }) });
      setShortlisted((s) => new Set(s).add(id));
      toast.success("Added to shortlist");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not shortlist");
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-3xl bg-white p-5 shadow-card">
        <h2 className="font-semibold">Filters</h2>
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">
            Keyword
            <Input className="mt-1" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </label>
          <label className="block">
            Skill
            <Input className="mt-1" value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. Color Grading" />
          </label>
          <label className="block">
            Specialization
            <select className="mt-1 h-11 w-full rounded-xl border border-ink/10 px-3" value={specialization} onChange={(e) => setSpecialization(e.target.value)}>
              <option value="">Any</option>
              {SPECIALIZATIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            AI tool
            <select className="mt-1 h-11 w-full rounded-xl border border-ink/10 px-3" value={tool} onChange={(e) => setTool(e.target.value)}>
              <option value="">Any</option>
              {TOOLS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Content type
            <select className="mt-1 h-11 w-full rounded-xl border border-ink/10 px-3" value={contentType} onChange={(e) => setContentType(e.target.value)}>
              <option value="">Any</option>
              {CONTENT_TYPES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block">
            Commercial use
            <select className="mt-1 h-11 w-full rounded-xl border border-ink/10 px-3" value={commercialUse} onChange={(e) => setCommercialUse(e.target.value)}>
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </label>
          <label className="block">
            Min. experience (years)
            <Input className="mt-1" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="e.g. 3" />
          </label>
        </div>
      </aside>
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h1 className="font-display text-4xl">Find AI creators</h1>
            <p className="text-sm text-ink/60">Ranked by match score from your filters and keyword.</p>
          </div>
          <p className="text-sm text-ink/50">{loading ? "Searching…" : `${results.length} creators`}</p>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-80 animate-pulse bg-violet-50" />
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card className="p-10 text-center text-ink/60">
            No creators match these filters. Try clearing a tool or specialization — empty results are expected when the
            combination is too narrow.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((c) => (
              <CreatorCard
                key={c.id}
                creator={c}
                shortlisted={shortlisted.has(c.id)}
                onShortlist={user?.role === "BRAND" ? () => shortlist(c.id) : undefined}
                onSend={user?.role === "BRAND" ? () => setSendTo(c) : undefined}
              />
            ))}
          </div>
        )}
      </div>
      <SendBriefModal
        open={!!sendTo}
        onClose={() => setSendTo(null)}
        creatorId={sendTo?.id || ""}
        creatorName={sendTo?.user.name || ""}
      />
    </div>
  );
}
