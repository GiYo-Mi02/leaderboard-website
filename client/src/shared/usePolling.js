import { useEffect, useRef } from "react";

export default function usePolling(fn, intervalMs = 15000, deps = []) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    let stopped = false;
    async function tick() {
      try {
        await fnRef.current();
      } catch {}
    }
    // immediate run
    tick();
    const id = setInterval(() => {
      if (!stopped) tick();
    }, intervalMs);
    return () => {
      stopped = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
