import { useCallback, useEffect, useRef, useState } from "react";

export const useRestTimer = () => {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRemainingRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const left = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
    setRemaining(left);

    if (left <= 0) {
      clearTimer();
      setIsRunning(false);

      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(200);
        } catch {
          // no-op on desktop
        }
      }
    }
  }, [clearTimer]);

  const start = useCallback(
    (seconds: number) => {
      clearTimer();
      endTimeRef.current = Date.now() + seconds * 1000;
      setRemaining(seconds);
      setIsRunning(true);
      intervalRef.current = setInterval(tick, 1000);
    },
    [clearTimer, tick],
  );

  const pause = useCallback(() => {
    if (!isRunning) return;
    clearTimer();
    pausedRemainingRef.current = Math.max(
      0,
      Math.ceil((endTimeRef.current - Date.now()) / 1000),
    );
    setRemaining(pausedRemainingRef.current);
    setIsRunning(false);
  }, [clearTimer, isRunning]);

  const resume = useCallback(() => {
    if (isRunning || pausedRemainingRef.current <= 0) return;
    endTimeRef.current = Date.now() + pausedRemainingRef.current * 1000;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, 1000);
  }, [isRunning, tick]);

  const reset = useCallback(() => {
    clearTimer();
    setRemaining(0);
    setIsRunning(false);
    pausedRemainingRef.current = 0;
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  return { remaining, isRunning, start, pause, resume, reset };
};
