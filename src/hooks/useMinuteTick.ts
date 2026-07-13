import { useEffect, useState } from "react";

// Re-renders the caller every `ms` (default 60s) so time-derived values (e.g. the
// effective exam status) update live without a manual refresh.
export function useMinuteTick(ms = 60_000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), ms);
    return () => clearInterval(t);
  }, [ms]);
}
