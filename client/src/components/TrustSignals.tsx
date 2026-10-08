import { BadgeCheck } from "lucide-react";
import type { Verification } from "@/types";

export function TrustSignals({ verification, trustScore }: { verification?: Verification | null; trustScore?: number }) {
  const items = [
    { ok: verification?.toolsVerified, label: "Tools documented" },
    { ok: verification?.portfolioAdded, label: "Portfolio added" },
    { ok: verification?.workflowDocumented, label: "Workflow documented" },
    { ok: verification?.previousWork, label: "Previous work" },
    { ok: verification?.commercialUseInfo, label: "Commercial-use information" },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <p className="text-sm font-semibold">Creator Trust Score</p>
        <p className="font-display text-3xl text-accent">{trustScore ?? verification?.score ?? 0}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-violet-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
          style={{ width: `${trustScore ?? verification?.score ?? 0}%` }}
        />
      </div>
      <ul className="space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item.label} className={item.ok ? "flex items-center gap-2 text-emerald-700" : "flex items-center gap-2 text-ink/40"}>
            <BadgeCheck className="h-4 w-4" />
            {item.label}
            <span className="ml-auto text-[11px] uppercase">{item.ok ? "Signal on" : "Incomplete"}</span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] leading-relaxed text-ink/50">
        Trust signals are computed from profile completeness, portfolio, tools, workflow, and commercial-use notes. They are
        not third-party certifications.
      </p>
    </div>
  );
}
