import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { api } from "@/services/api";

export function BriefNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "Premium Sneaker Launch",
    description: "I need a 30-second cinematic AI advertisement for a premium sneaker brand.",
    contentType: "AI Product Video",
    style: "Cinematic",
    targetAudience: "18-34 fashion-forward athletes",
    platform: "Instagram",
    aspectRatio: "9:16",
    duration: "30 seconds",
    requiredTools: "Runway, Sora",
    requiredSkills: "AI Video Direction, Product Cinematography",
    commercialUse: true,
    deadline: "",
    budget: "$8,000 – $12,000",
    deliverables: "Master 30s, 9:16 crop, 3 stills",
    creativeDirection: "Wet asphalt, sculptural lighting, premium materials.",
  });
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    setSaving(true);
    try {
      const data = await api<{ brief: { id: string } }>("/api/briefs", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          requiredTools: split(form.requiredTools),
          requiredSkills: split(form.requiredSkills),
          deliverables: split(form.deliverables),
          deadline: form.deadline || null,
        }),
      });
      toast.success("Brief created");
      navigate(`/briefs/${data.brief.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save brief");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl">Create a brief</h1>
      <p className="mt-2 text-ink/60">Define campaign, format, tools, and commercial-use requirements.</p>
      <Card className="mt-6 p-6">
        <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
          <Input className="md:col-span-2" placeholder="Campaign title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea className="md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Input placeholder="Content type" value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })} />
          <Input placeholder="Style" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })} />
          <Input placeholder="Target audience" value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} />
          <Input placeholder="Platform" value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} />
          <Input placeholder="Aspect ratio" value={form.aspectRatio} onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })} />
          <Input placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          <Input placeholder="Required tools" value={form.requiredTools} onChange={(e) => setForm({ ...form, requiredTools: e.target.value })} />
          <Input placeholder="Required skills" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} />
          <Input placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Input className="md:col-span-2" placeholder="Deliverables" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} />
          <Textarea className="md:col-span-2" placeholder="Creative direction" value={form.creativeDirection} onChange={(e) => setForm({ ...form, creativeDirection: e.target.value })} />
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.commercialUse} onChange={(e) => setForm({ ...form, commercialUse: e.target.checked })} />
            Commercial use required
          </label>
          <Button type="submit" variant="accent" className="md:col-span-2" disabled={saving}>
            {saving ? "Saving…" : "Save brief"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
