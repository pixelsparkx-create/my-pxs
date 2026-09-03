import { supabase } from "@/integrations/supabase/client";

export type EngagementCounts = {
  appreciations: number;
  views: number;
  live_visits: number;
};

const VISITOR_KEY = "pxs_visitor_id";
const VIEWED_KEY = "pxs_viewed_projects";

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id || id.length < 8) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "")
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function viewedSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(sessionStorage.getItem(VIEWED_KEY) || "[]") as string[]);
  } catch {
    return new Set();
  }
}

export function markViewedLocally(projectId: string) {
  const s = viewedSet();
  s.add(projectId);
  try {
    sessionStorage.setItem(VIEWED_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export function alreadyViewedThisSession(projectId: string) {
  return viewedSet().has(projectId);
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

type Row = { project_id: string; appreciations: number; views: number; live_visits: number };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rpc = (name: string, args: Record<string, unknown>) => (supabase as any).rpc(name, args);

export async function fetchEngagement(projectId: string): Promise<EngagementCounts | null> {
  const { data, error } = await rpc("get_project_engagement", { _project_ids: [projectId] });
  if (error || !data?.length) return null;
  const row = data[0] as Row;
  return { appreciations: row.appreciations, views: row.views, live_visits: row.live_visits };
}

export async function fetchHasAppreciated(projectId: string): Promise<boolean> {
  const visitor = getVisitorId();
  if (!visitor) return false;
  const { data, error } = await rpc("has_appreciated", {
    _project_id: projectId,
    _visitor_id: visitor,
  });
  if (error) return false;
  return Boolean(data);
}

/**
 * Client-side first line of defence against double taps and refresh loops.
 * The database enforces the real cooldown + rate limits; this simply avoids
 * firing obviously redundant requests.
 */
const CLIENT_COOLDOWN_MS: Record<string, number> = {
  view: 30 * 60 * 1000,
  live_visit: 5 * 60 * 1000,
  appreciation: 2 * 1000,
};
const COOLDOWN_KEY = "pxs_interaction_cooldowns";
const inFlight = new Set<string>();

function cooldowns(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(COOLDOWN_KEY) || "{}") as Record<string, number>;
  } catch {
    return {};
  }
}

function shouldSend(key: string, windowMs: number): boolean {
  const map = cooldowns();
  const last = map[key] ?? 0;
  if (Date.now() - last < windowMs) return false;
  map[key] = Date.now();
  try {
    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
  return true;
}

export async function recordInteraction(
  projectId: string,
  type: "view" | "appreciation" | "live_visit",
): Promise<EngagementCounts | null> {
  const visitor = getVisitorId();
  if (!visitor) return null;

  const key = `${type}:${projectId}`;
  if (inFlight.has(key)) return null;
  if (!shouldSend(key, CLIENT_COOLDOWN_MS[type] ?? 1000)) return null;

  inFlight.add(key);
  try {
    const { data, error } = await rpc("record_project_interaction", {
      _project_id: projectId,
      _interaction_type: type,
      _visitor_id: visitor,
    });
    if (error || !data?.length) return null;
    const row = data[0] as Row;
    return { appreciations: row.appreciations, views: row.views, live_visits: row.live_visits };
  } finally {
    inFlight.delete(key);
  }
}

