import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";

/** API-only overlay debounce (router / link navigation uses 0). */
const QUERY_OVERLAY_DELAY_MS = 140;

/**
 * Centered frosted overlay when the router or React Query is busy.
 * Renders under `RouterProvider` (see `__root.tsx`).
 */
export function GlobalApiLoadingIndicator() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  const apiPending = fetching + mutating;

  /** Covers in-app links: `location` updates before `resolvedLocation` while the new route loads. */
  const routerBusy = useRouterState({
    select: (s) => {
      const hrefSettling = s.location.href !== s.resolvedLocation.href;
      const pendingMatches =
        (s.pendingMatches?.length ?? 0) > 0 ||
        (Array.isArray(s.matches) &&
          s.matches.some((m) => m.status === "pending"));
      return Boolean(
        s.isLoading ||
        s.isTransitioning ||
        s.status === "pending" ||
        hrefSettling ||
        pendingMatches,
      );
    },
  });

  const pending = apiPending + (routerBusy ? 1 : 0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (pending === 0) {
      setRevealed(false);
      return;
    }
    const onlyNavigation = routerBusy && apiPending === 0;
    const delay = onlyNavigation ? 0 : QUERY_OVERLAY_DELAY_MS;
    const id = window.setTimeout(() => setRevealed(true), delay);
    return () => window.clearTimeout(id);
  }, [pending, routerBusy, apiPending]);

  if (pending === 0 || !revealed) return null;

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-[200] flex cursor-wait items-center justify-center bg-background/40 p-6 backdrop-blur-md supports-[backdrop-filter]:bg-background/25 animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Đang tải"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background)/0.55)_75%)]"
        aria-hidden
      />
      <div className="relative flex max-w-[min(92vw,22rem)] cursor-default flex-col items-center gap-5 rounded-3xl border border-white/50 bg-white/75 px-10 py-9 shadow-2xl shadow-primary/10 ring-1 ring-black/5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300 dark:border-white/10 dark:bg-zinc-950/70 dark:ring-white/10">
        <div className="relative grid h-36 w-36 shrink-0 place-items-center">
          <div
            className="global-api-loading-overlay-glow absolute inset-[-18%] rounded-full bg-gradient-to-tr from-fuchsia-500/50 via-violet-500/40 to-cyan-400/50 blur-2xl"
            aria-hidden
          />
          <div
            className="global-api-loading-overlay-orbit absolute inset-0 rounded-full border-2 border-dashed border-primary/35"
            aria-hidden
          />
          <div
            className="global-api-loading-overlay-orbit-rev absolute inset-2 rounded-full border-2 border-transparent border-t-fuchsia-500 border-r-violet-500 opacity-90"
            aria-hidden
          />
          <div
            className="global-api-loading-overlay-blob relative z-10 h-[4.25rem] w-[4.25rem] shadow-[0_8px_32px_rgba(124,58,237,0.35)] ring-4 ring-white/60 dark:ring-white/10"
            aria-hidden
          />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            className="global-api-loading-overlay-text bg-gradient-to-r from-fuchsia-600 via-violet-600 to-cyan-600 bg-clip-text text-lg font-bold tracking-tight text-transparent dark:from-fuchsia-400 dark:via-violet-400 dark:to-cyan-400"
            style={{
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Đang tải…
          </p>
          <p className="text-xs text-muted-foreground">
            Chờ tí, dữ liệu đang bay tới
          </p>
        </div>
        <div className="flex items-center gap-2.5" aria-hidden>
          <span className="global-api-loading-overlay-dot h-2.5 w-2.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 shadow-sm" />
          <span className="global-api-loading-overlay-dot h-2.5 w-2.5 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 shadow-sm" />
          <span className="global-api-loading-overlay-dot h-2.5 w-2.5 rounded-full bg-gradient-to-br from-cyan-500 to-amber-400 shadow-sm" />
        </div>
      </div>
    </div>
  );
}
