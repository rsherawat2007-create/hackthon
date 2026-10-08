import { FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { SPECIALIZATIONS, TOOLS, CONTENT_TYPES } from "@/types";

function csv(v: string[]) {
  return v.join(", ");
}

export function CreatorProfileEdit() {
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    headline: "",
    bio: "",
    location: "",
    avatarUrl: "",
    experience: "",
    experienceYears: 0,
    commercialUse: true,
    commercialNotes: "",
    workflow: "",
    skills: "",
    specializations: "",
    tools: "",
    aiModels: "",
    contentTypes: "",
  });

  useEffect(() => {
    api<{ user: { creatorProfile: Record<string, unknown> | null } }>("/api/auth/me").then((d) => {
      const p = d.user.creatorProfile;
      if (!p) return;
      setForm({
        headline: String(p.headline || ""),
        bio: String(p.bio || ""),
        location: String(p.location || ""),
        avatarUrl: String(p.avatarUrl || ""),
        experience: String(p.experience || ""),
        experienceYears: Number(p.experienceYears || 0),
        commercialUse: Boolean(p.commercialUse),
        commercialNotes: String(p.commercialNotes || ""),
        workflow: String(p.workflow || ""),
        skills: csv((p.skills as string[]) || []),
        specializations: csv((p.specializations as string[]) || []),
        tools: csv((p.tools as string[]) || []),
        aiModels: csv((p.aiModels as string[]) || []),
        contentTypes: csv((p.contentTypes as string[]) || []),
      });
    });
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);
    try {
      await api("/api/creators/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          experienceYears: Number(form.experienceYears),
          skills: split(form.skills),
          specializations: split(form.specializations),
          tools: split(form.tools),
          aiModels: split(form.aiModels),
          contentTypes: split(form.contentTypes),
        }),
      });
      await refresh();
      toast.success("Profile saved — trust score refreshed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-5xl">Creator profile</h1>
      <Card className="mt-6 p-6">
        <form className="grid gap-3" onSubmit={onSubmit}>
          <Input placeholder="Headline" value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} />
          <Input placeholder="Profile image URL" value={form.avatarUrl} onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })} />
          <Textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Input placeholder="Experience" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
          <Input type="number" placeholder="Years" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
          <Input placeholder={`Skills (comma separated)`} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <Input placeholder={`Specializations e.g. ${SPECIALIZATIONS[0]}`} value={form.specializations} onChange={(e) => setForm({ ...form, specializations: e.target.value })} />
          <Input placeholder={`Tools e.g. ${TOOLS.slice(0, 3).join(", ")}`} value={form.tools} onChange={(e) => setForm({ ...form, tools: e.target.value })} />
          <Input placeholder="AI models" value={form.aiModels} onChange={(e) => setForm({ ...form, aiModels: e.target.value })} />
          <Input placeholder={`Content types e.g. ${CONTENT_TYPES[0]}`} value={form.contentTypes} onChange={(e) => setForm({ ...form, contentTypes: e.target.value })} />
          <Textarea placeholder="Workflow" value={form.workflow} onChange={(e) => setForm({ ...form, workflow: e.target.value })} />
          <Textarea placeholder="Commercial-use notes" value={form.commercialNotes} onChange={(e) => setForm({ ...form, commercialNotes: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.commercialUse} onChange={(e) => setForm({ ...form, commercialUse: e.target.checked })} />
            Available for commercial use
          </label>
          <Button type="submit" variant="accent">
            Save profile
          </Button>
        </form>
      </Card>
    </div>
  );
}
