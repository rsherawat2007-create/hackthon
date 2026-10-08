import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import type { PortfolioItem } from "@/types";

const blank = {
  title: "",
  description: "",
  mediaUrl: "",
  thumbnailUrl: "",
  contentType: "AI Video",
  toolsUsed: "Runway",
  aiModelsUsed: "Runway Gen-3",
  skills: "",
  aspectRatio: "9:16",
  commercialUse: true,
  date: new Date().toISOString().slice(0, 10),
  category: "Product Advertisement",
  workflow: "",
};

export function PortfolioManage() {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [form, setForm] = useState(blank);
  const creatorId = user?.creatorProfile?.id;

  async function load() {
    if (!creatorId) return;
    const d = await api<{ portfolio: PortfolioItem[] }>(`/api/portfolio/${creatorId}`);
    setItems(d.portfolio);
  }

  useEffect(() => {
    load();
  }, [creatorId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    try {
      await api("/api/portfolio", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          toolsUsed: split(form.toolsUsed),
          aiModelsUsed: split(form.aiModelsUsed),
          skills: split(form.skills),
        }),
      });
      toast.success("Project added");
      setForm(blank);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add project");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    await api(`/api/portfolio/${id}`, { method: "DELETE" });
    toast.success("Deleted");
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-5xl">Portfolio</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <h2 className="font-semibold">Add project</h2>
          <form className="mt-3 grid gap-3" onSubmit={onSubmit}>
            <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <Input placeholder="Media URL" value={form.mediaUrl} onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} required />
            <Input placeholder="Thumbnail URL" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} required />
            <Input placeholder="Content type" value={form.contentType} onChange={(e) => setForm({ ...form, contentType: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Tools used" value={form.toolsUsed} onChange={(e) => setForm({ ...form, toolsUsed: e.target.value })} />
            <Input placeholder="AI models" value={form.aiModelsUsed} onChange={(e) => setForm({ ...form, aiModelsUsed: e.target.value })} />
            <Input placeholder="Skills" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            <Input placeholder="Aspect ratio" value={form.aspectRatio} onChange={(e) => setForm({ ...form, aspectRatio: e.target.value })} />
            <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Textarea placeholder="Workflow" value={form.workflow} onChange={(e) => setForm({ ...form, workflow: e.target.value })} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.commercialUse} onChange={(e) => setForm({ ...form, commercialUse: e.target.checked })} />
              Commercial use
            </label>
            <Button type="submit" variant="accent">
              Add to portfolio
            </Button>
          </form>
        </Card>
        <div className="space-y-3">
          {items.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <img src={p.thumbnailUrl} alt="" className="h-36 w-full object-cover" />
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-xs text-ink/50">{p.contentType}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => remove(p.id)}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
