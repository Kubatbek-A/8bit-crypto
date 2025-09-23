import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { usePolling } from "../usePolling";
import type { PollingCallback } from "../usePolling";

describe("usePolling", () => {
  let polling: ReturnType<typeof usePolling>;
  let mockCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockCallback = vi.fn();
    polling = usePolling();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should start polling with default interval", () => {
    polling.startPolling(mockCallback as unknown as PollingCallback);

    expect(polling.isPolling.value).toBe(true);
    expect(polling.pollingInterval.value).toBe(10000);
    expect(polling.nextUpdateTime.value).toBeInstanceOf(Date);
  });

  it("should start polling with custom interval", () => {
    const customInterval = 5000;
    polling.startPolling(
      mockCallback as unknown as PollingCallback,
      customInterval
    );

    expect(polling.isPolling.value).toBe(true);
    expect(polling.pollingInterval.value).toBe(customInterval);
  });

  it("should stop polling", () => {
    polling.startPolling(mockCallback as unknown as PollingCallback);
    expect(polling.isPolling.value).toBe(true);

    polling.stopPolling();
    expect(polling.isPolling.value).toBe(false);
    expect(polling.nextUpdateTime.value).toBe(null);
  });

  it("should execute callback periodically", () => {
    polling.startPolling(mockCallback as unknown as PollingCallback, 1000);

    vi.advanceTimersByTime(1000);
    expect(mockCallback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1000);
    expect(mockCallback).toHaveBeenCalledTimes(2);
  });

  it("should handle callback errors", () => {
    const errorCallback = vi.fn().mockRejectedValue(new Error("Test error"));

    polling.startPolling(errorCallback as unknown as PollingCallback, 1000);

    expect(() => vi.advanceTimersByTime(1000)).not.toThrow();
    expect(errorCallback).toHaveBeenCalledTimes(1);
  });

  it("should throw error for invalid callback", () => {
    expect(() => polling.startPolling(null as any)).toThrow(
      "Callback must be a function"
    );
    expect(() => polling.startPolling(undefined as any)).toThrow(
      "Callback must be a function"
    );
  });

  it("should update interval when not polling", () => {
    polling.updateInterval(5000, mockCallback as unknown as PollingCallback);
    expect(polling.pollingInterval.value).toBe(5000);
    expect(polling.isPolling.value).toBe(false);
  });

  it("should update interval and restart polling when active", () => {
    polling.startPolling(mockCallback as unknown as PollingCallback, 10000);
    polling.updateInterval(5000, mockCallback as unknown as PollingCallback);

    expect(polling.pollingInterval.value).toBe(5000);
    expect(polling.isPolling.value).toBe(true);
  });

  it("should calculate time remaining", () => {
    polling.startPolling(mockCallback as unknown as PollingCallback, 10000);

    const timeRemaining = polling.getTimeRemaining();
    expect(timeRemaining).toBeGreaterThan(0);
    expect(timeRemaining).toBeLessThanOrEqual(10);
  });

  it("should return 0 time remaining when not polling", () => {
    const timeRemaining = polling.getTimeRemaining();
    expect(timeRemaining).toBe(0);
  });

  it("should stop polling on unmount", () => {
    polling.startPolling(mockCallback as unknown as PollingCallback);
    expect(polling.isPolling.value).toBe(true);

    // Simulate unmount
    polling.stopPolling();
    expect(polling.isPolling.value).toBe(false);
  });
});
