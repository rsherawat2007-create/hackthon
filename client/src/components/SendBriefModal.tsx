import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import type { Brief } from "@/types";
import { Modal } from "./ui/modal";
import { Button } from "./ui/button";

export function SendBriefModal({
  open,
  onClose,
  creatorId,
  creatorName,
}: {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  creatorName: string;
}) {
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [briefId, setBriefId] = useState("");
  const [message, setMessage] = useState("We'd love to collaborate on this campaign.");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    api<{ briefs: Brief[] }>("/api/briefs")
      .then((d) => {
        setBriefs(d.briefs);
        setBriefId(d.briefs[0]?.id || "");
      })
      .catch(() => setBriefs([]));
  }, [open]);

  async function send() {
    if (!briefId) {
      toast.error("Create a brief first");
      return;
    }
    setSending(true);
    try {
      await api("/api/engagements", {
        method: "POST",
        body: JSON.stringify({ creatorId, briefId, message }),
      });
      toast.success(`Brief sent to ${creatorName}`);
      onClose();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not send brief");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Send brief to ${creatorName}`}>
      {briefs.length === 0 ? (
        <p className="text-sm text-ink/60">You have no briefs yet. Create one in the AI Brief Builder first.</p>
      ) : (
        <div className="space-y-3">
          <label className="text-sm font-medium">Choose brief</label>
          <select
            className="h-11 w-full rounded-xl border border-ink/10 bg-white px-3"
            value={briefId}
            onChange={(e) => setBriefId(e.target.value)}
          >
            {briefs.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
          <textarea className="min-h-24 w-full rounded-xl border border-ink/10 p-3 text-sm" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button variant="accent" className="w-full" disabled={sending} onClick={send}>
            {sending ? "Sending…" : "Send brief"}
          </Button>
        </div>
      )}
    </Modal>
  );
}
