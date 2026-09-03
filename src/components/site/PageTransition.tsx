import { useRouterState } from "@tanstack/react-router";
import { ReactNode, useEffect } from "react";

const HEADER_OFFSET = 88;

function scrollToHash(hash: string) {
  const id = decodeURIComponent(hash.replace(/^#/, ""));
  if (!id) return false;

  let tries = 0;
  const tick = () => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
      try {
        window.scrollTo({ top, behavior: "smooth" });
      } catch {
        window.scrollTo(0, top);
      }
      // Fallback for browsers/environments that ignore smooth scrolling.
      window.setTimeout(() => {
        const current = window.scrollY;
        const target = el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
        if (Math.abs(current - target) > 8) window.scrollTo(0, target);
      }, 700);
      return;
    }
    if (tries++ < 60) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return true;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    if (hash) {
      scrollToHash(hash);
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname, hash]);

  // Direct page loads and in-page anchor clicks (no router state change).
  useEffect(() => {
    if (window.location.hash) scrollToHash(window.location.hash);
    const onHashChange = () => scrollToHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div key={pathname} className="animate-fade-in">
      {children}
    </div>
  );
}
