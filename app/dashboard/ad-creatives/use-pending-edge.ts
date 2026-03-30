"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `onStart` on the leading edge of `isPending` becoming true and
 * `onEnd` on the trailing edge when it returns to false.
 *
 * Callbacks are read via refs so they can be inline functions that close
 * over state without needing to be wrapped in `useCallback`.
 */
export function usePendingEdge(
  isPending: boolean,
  onStart: () => void,
  onEnd: () => void,
): void {
  const previousRef = useRef(false);
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  onStartRef.current = onStart;
  onEndRef.current = onEnd;

  useEffect(() => {
    if (isPending && !previousRef.current) onStartRef.current();
    if (!isPending && previousRef.current) onEndRef.current();
    previousRef.current = isPending;
  }, [isPending]);
}
