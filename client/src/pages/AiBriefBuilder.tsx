import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

type BriefJson = {
  campaignTitle: string;
  contentType: string;
  style: string;
  targetAudience: string;
  platform: string;
  aspectRatio: string;
  duration: string;
  requiredSkills: string[];
  recommendedTools: string[];
  commercialUse: boolean;
  deliverables: string[];
  creativeDirection: string;
  description?: string;
};

const empty: BriefJson = {
  campaignTitle: "",
  contentType: "",
  style: "",
  targetAudience: "",
  platform: "",
  aspectRatio: "",
  duration: "",
  requiredSkills: [],
  recommendedTools: [],
  commercialUse: true,
  deliverables: [],
  creativeDirection: "",
};

export function AiBriefBuilder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState("I need a 30-second cinematic AI advertisement for a premium sneaker brand.");
  const [brief, setBrief] = useState<BriefJson>(empty);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!user) return navigate("/login");
    setLoading(true);
    try {
      const data = await api<{ brief: BriefJson; source: string }>("/api/ai/generate-brief", {
        method: "POST",
        body: JSON.stringify({ idea }),
      });
      setBrief({ ...data.brief, description: data.brief.description || idea });
      setSource(data.source);
      toast.success(data.source === "demo" ? "Demo brief generated (no API key)" : "Brief generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function save() {
    if (!user || user.role !== "BRAND") return toast.error("Login as a brand to save briefs");
    try {
      const data = await api<{ brief: { id: string } }>("/api/briefs", {
        method: "POST",
        body: JSON.stringify({
          title: brief.campaignTitle,
          description: brief.description || idea,
          contentType: brief.contentType,
          style: brief.style,
          targetAudience: brief.targetAudience,
          platform: brief.platform,
          aspectRatio: brief.aspectRatio,
          duration: brief.duration,
          requiredTools: brief.recommendedTools,
          requiredSkills: brief.requiredSkills,
          commercialUse: brief.commercialUse,
          deliverables: brief.deliverables,
          creativeDirection: brief.creativeDirection,
        }),
      });
      toast.success("Brief saved");
      navigate(`/briefs/${data.brief.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    }
  }

  function listField(value: string[], key: keyof BriefJson) {
    return (
      <Input
        value={value.join(", ")}
        onChange={(e) => setBrief({ ...brief, [key]: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-5xl">AI Brief Builder</h1>
      <p className="mt-2 text-ink/60">Turn a rough idea into a production-ready creative brief.</p>
      <Card className="mt-6 space-y-3 p-6">
        <Textarea value={idea} onChange={(e) => setIdea(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="accent" onClick={generate} disabled={loading}>
            {loading ? "Generating…" : brief.campaignTitle ? "Regenerate" : "Generate brief"}
          </Button>
        </div>
        {source && <p className="text-xs text-ink/40">Source: {source === "demo" ? "deterministic demo fallback" : "OpenAI-compatible model"}</p>}
      </Card>
      {brief.campaignTitle && (
        <Card className="mt-6 grid gap-3 p-6 md:grid-cols-2">
          <label className="text-sm">
            Campaign title
            <Input value={brief.campaignTitle} onChange={(e) => setBrief({ ...brief, campaignTitle: e.target.value })} />
          </label>
          <label className="text-sm">
            Content type
            <Input value={brief.contentType} onChange={(e) => setBrief({ ...brief, contentType: e.target.value })} />
          </label>
          <label className="text-sm">
            Style
            <Input value={brief.style} onChange={(e) => setBrief({ ...brief, style: e.target.value })} />
          </label>
          <label className="text-sm">
            Platform
            <Input value={brief.platform} onChange={(e) => setBrief({ ...brief, platform: e.target.value })} />
          </label>
          <label className="text-sm">
            Aspect ratio
            <Input value={brief.aspectRatio} onChange={(e) => setBrief({ ...brief, aspectRatio: e.target.value })} />
          </label>
          <label className="text-sm">
            Duration
            <Input value={brief.duration} onChange={(e) => setBrief({ ...brief, duration: e.target.value })} />
          </label>
          <label className="text-sm md:col-span-2">
            Target audience
            <Input value={brief.targetAudience} onChange={(e) => setBrief({ ...brief, targetAudience: e.target.value })} />
          </label>
          <label className="text-sm">
            Required skills
            {listField(brief.requiredSkills, "requiredSkills")}
          </label>
          <label className="text-sm">
            Recommended tools
            {listField(brief.recommendedTools, "recommendedTools")}
          </label>
          <label className="text-sm md:col-span-2">
            Deliverables
            {listField(brief.deliverables, "deliverables")}
          </label>
          <label className="text-sm md:col-span-2">
            Creative direction
            <Textarea value={brief.creativeDirection} onChange={(e) => setBrief({ ...brief, creativeDirection: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={brief.commercialUse} onChange={(e) => setBrief({ ...brief, commercialUse: e.target.checked })} />
            Commercial use required
          </label>
          <Button onClick={save} className="md:col-span-2">
            Save brief
          </Button>
        </Card>
      )}
    </div>
  );
}
