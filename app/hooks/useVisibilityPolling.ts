// The smart polling system that pauses refreshing when you switch tabs

import { useEffect, useRef } from 'react';

/**
 * Runs `callback` once immediately, then on a fixed interval, but pauses
 * while the tab is hidden and re-fires immediately when the tab becomes
 * visible again. Prevents background tabs from burning battery and API
 * quota on polls the user will never see.
 *
 * The callback is stored in a ref so callers don't need to memoize it —
 * the effect only re-runs when the interval changes.
 */
export function useVisibilityPolling(
  callback: () => void | Promise<void>,
  intervalMs: number
): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const run = () => {
      if (cancelled) return;
      void callbackRef.current();
    };

    const start = () => {
      if (timer !== null) return;
      run();
      timer = setInterval(run, intervalMs);
    };

    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    };

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs]);
}
