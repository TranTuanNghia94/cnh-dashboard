import { useIsMutating } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/** Only hard navigations / mutations show a thin top bar — never block the whole UI for background fetches. */
const SHOW_DELAY_MS = 120;

/**
 * Non-blocking top progress when the router is navigating or a mutation is in flight.
 * Background React Query fetches do not freeze the screen.
 */
export function GlobalApiLoadingIndicator() {
  const mutating = useIsMutating();

  const routerBusy = useRouterState({
    select: (s) => {
      const hrefSettling =
        s.resolvedLocation != null &&
        s.location.href !== s.resolvedLocation.href;
      return Boolean(s.isLoading || s.status === "pending" || hrefSettling);
    },
  });

  const pending = mutating + (routerBusy ? 1 : 0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (pending === 0) {
      setRevealed(false);
      return;
    }
    const id = window.setTimeout(() => setRevealed(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [pending]);

  if (pending === 0 || !revealed) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Đang tải"
    >
      <div className="h-full w-full origin-left animate-pulse bg-primary/80" />
    </div>
  );
}
