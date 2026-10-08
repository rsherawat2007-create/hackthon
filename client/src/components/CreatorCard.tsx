import { Link } from "react-router-dom";
import type { Creator } from "@/types";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { MatchBadge } from "./MatchBadge";
import { MapPin } from "lucide-react";

export function CreatorCard({
  creator,
  onShortlist,
  onSend,
  shortlisted,
}: {
  creator: Creator;
  onShortlist?: () => void;
  onSend?: () => void;
  shortlisted?: boolean;
}) {
  const preview = creator.portfolio?.[0];
  return (
    <Card className="overflow-hidden transition hover:-translate-y-0.5">
      <div className="relative h-40 bg-violet-100">
        {preview ? (
          <img src={preview.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">No portfolio yet</div>
        )}
        <div className="absolute left-3 top-3">
          <MatchBadge match={creator.match} />
        </div>
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start gap-3">
          <img src={creator.avatarUrl} alt="" className="h-12 w-12 rounded-2xl object-cover" />
          <div>
            <h3 className="font-semibold">{creator.user.name}</h3>
            <p className="text-sm text-ink/60">{creator.specializations[0] || creator.headline}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-ink/50">
              <MapPin className="h-3 w-3" /> {creator.location}
            </p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-[10px] uppercase tracking-wide text-ink/40">Trust</p>
            <p className="font-display text-xl">{creator.trustScore}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {creator.skills.slice(0, 3).map((s) => (
            <span key={s} className="chip">
              {s}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px] text-ink/50">
          {creator.tools.slice(0, 4).map((t) => (
            <span key={t} className="rounded-md bg-ink/5 px-2 py-1">
              {t}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild>
            <Link to={`/creators/${creator.id}`}>View Profile</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link to={`/creators/${creator.id}#portfolio`}>View Portfolio</Link>
          </Button>
          {onShortlist && (
            <Button size="sm" variant="outline" onClick={onShortlist}>
              {shortlisted ? "Shortlisted" : "Shortlist"}
            </Button>
          )}
          {onSend && (
            <Button size="sm" variant="accent" onClick={onSend}>
              Send Brief
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
