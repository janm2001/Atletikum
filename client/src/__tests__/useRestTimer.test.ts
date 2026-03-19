import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useRestTimer } from "@/hooks/useRestTimer";

describe("useRestTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with remaining 0 and not running", () => {
    const { result } = renderHook(() => useRestTimer());
    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it("starts a timer and counts down", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(90));
    expect(result.current.isRunning).toBe(true);
    expect(result.current.remaining).toBeGreaterThan(0);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.remaining).toBeLessThanOrEqual(89);
  });

  it("reaches 0 and stops", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(2));
    act(() => vi.advanceTimersByTime(3000));

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it("pause and resume work", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(60));
    act(() => vi.advanceTimersByTime(1000));
    act(() => result.current.pause());

    expect(result.current.isRunning).toBe(false);
    const paused = result.current.remaining;

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.remaining).toBe(paused);

    act(() => result.current.resume());
    expect(result.current.isRunning).toBe(true);
  });

  it("reset stops the timer", () => {
    const { result } = renderHook(() => useRestTimer());

    act(() => result.current.start(60));
    act(() => result.current.reset());

    expect(result.current.remaining).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });
});
