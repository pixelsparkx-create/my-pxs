import { useCallback, useEffect, useRef, useState } from "react";
import { Heart, Eye, ArrowUpRight } from "lucide-react";
import {
  alreadyViewedThisSession,
  fetchEngagement,
  fetchHasAppreciated,
  formatCount,
  markViewedLocally,
  recordInteraction,
  type EngagementCounts,
} from "@/lib/engagement";

export function useProjectEngagement(projectId: string | null) {
  const [counts, setCounts] = useState<EngagementCounts | null>(null);
  const [appreciated, setAppreciated] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    if (!projectId) {
      setCounts(null);
      setAppreciated(false);
      return;
    }
    let alive = true;

    (async () => {
      const [mine] = await Promise.all([fetchHasAppreciated(projectId)]);
      if (!alive) return;
      setAppreciated(mine);

      if (alreadyViewedThisSession(projectId)) {
        const c = await fetchEngagement(projectId);
        if (alive && c) setCounts(c);
      } else {
        markViewedLocally(projectId);
        const c = await recordInteraction(projectId, "view");
        if (alive && c) setCounts(c);
      }
    })();

    return () => {
      alive = false;
    };
  }, [projectId]);

  const appreciate = useCallback(async () => {
    if (!projectId || appreciated || busy.current) return;
    busy.current = true;
    setAppreciated(true);
    setCounts((c) => (c ? { ...c, appreciations: c.appreciations + 1 } : c));
    const res = await recordInteraction(projectId, "appreciation");
    if (res) setCounts(res);
    busy.current = false;
  }, [projectId, appreciated]);

  const registerLiveVisit = useCallback(() => {
    if (!projectId) return;
    setCounts((c) => (c ? { ...c, live_visits: c.live_visits + 1 } : c));
    void recordInteraction(projectId, "live_visit");
  }, [projectId]);

  return { counts, appreciated, appreciate, registerLiveVisit };
}

export function EngagementBar({
  counts,
  appreciated,
  onAppreciate,
}: {
  counts: EngagementCounts | null;
  appreciated: boolean;
  onAppreciate: () => void;
}) {
  const hasEngagement = !!counts && counts.appreciations > 0;

  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
      <div className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
        <span className="inline-flex items-center gap-1.5">
          <Heart className={`h-3.5 w-3.5 ${appreciated ? "fill-gold text-gold" : "text-gold"}`} />
          {counts ? formatCount(counts.appreciations) : "—"}
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1.5">
          <Eye className="h-3.5 w-3.5 text-foreground/50" />
          {counts ? formatCount(counts.views) : "—"}
        </span>
        <span className="text-border">·</span>
        <span className="inline-flex items-center gap-1.5">
          <ArrowUpRight className="h-3.5 w-3.5 text-foreground/50" />
          {counts ? formatCount(counts.live_visits) : "—"}
        </span>
      </div>

      <button
        type="button"
        onClick={onAppreciate}
        disabled={appreciated}
        aria-pressed={appreciated}
        className={`group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
          appreciated
            ? "border-gold/50 bg-gold/10 text-gold shadow-[0_0_20px_rgba(212,175,55,0.25)]"
            : "border-border bg-card text-foreground/80 hover:border-gold hover:text-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.18)]"
        }`}
      >
        <Heart
          className={`h-4 w-4 transition-transform duration-300 ${
            appreciated ? "fill-current scale-110" : "group-hover:scale-110"
          }`}
        />
        {appreciated
          ? "Appreciated"
          : hasEngagement
            ? "Appreciate this project"
            : "Be the first to appreciate this project"}
      </button>
    </div>
  );
}
