/**
 * useMediaQuery hook.
 * Replaces MobileDetect library with standard CSS media query matching.
 */

import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    // Initial check (if not matched accurately in useState, queue it avoiding synchronous setState)
    if (mql.matches !== matches) {
      setMatches(mql.matches);
    }
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query, matches]);

  return matches;
}

/** Convenience: true when viewport < 768px */
export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

/** Convenience: true when viewport >= 1024px */
export function useIsDesktop() {
  return useMediaQuery("(min-width: 1024px)");
}
