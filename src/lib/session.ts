const KEY = "pixelspark.visitor.session.v1";

/** Stable per-browser session id used to tie Goldie, pricing plans and contact activity to one lead. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;
    const id = `pxs-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    return "anonymous";
  }
}
