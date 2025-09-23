import { ref, onUnmounted, type Ref } from "vue";
import { POLLING_CONFIG } from "@/constants/api";

type PollingCallback = () => Promise<void> | void;

export function usePolling() {
  const isPolling: Ref<boolean> = ref(false);
  const nextUpdateTime: Ref<Date | null> = ref(null);
  const pollingInterval: Ref<number> = ref(POLLING_CONFIG.INTERVAL);

  let refreshInterval: number | null = null;
  let countdownInterval: number | null = null;

  const startPolling = (
    callback: PollingCallback,
    intervalMs: number = POLLING_CONFIG.INTERVAL
  ): void => {
    if (typeof callback !== "function") {
      throw new Error("Callback must be a function");
    }

    stopPolling();

    pollingInterval.value = intervalMs;
    isPolling.value = true;
    nextUpdateTime.value = new Date(Date.now() + intervalMs);

    refreshInterval = setInterval(async () => {
      try {
        await callback();
        nextUpdateTime.value = new Date(Date.now() + intervalMs);
      } catch (error) {
        console.error("Polling callback error:", error);
      }
    }, intervalMs);

    countdownInterval = setInterval(() => {
      if (nextUpdateTime.value) {
        const now = new Date();
        const timeLeft = nextUpdateTime.value.getTime() - now.getTime();
        if (timeLeft <= 0) {
          nextUpdateTime.value = new Date(Date.now() + intervalMs);
        }
      }
    }, POLLING_CONFIG.COUNTDOWN_INTERVAL);
  };

  const stopPolling = (): void => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
    isPolling.value = false;
    nextUpdateTime.value = null;
  };

  const getTimeRemaining = (): number => {
    if (!nextUpdateTime.value) return 0;
    const now = new Date();
    const timeLeft = Math.max(
      0,
      Math.floor((nextUpdateTime.value.getTime() - now.getTime()) / 1000)
    );
    return timeLeft;
  };

  const updateInterval = (
    intervalMs: number,
    callback: PollingCallback
  ): void => {
    if (isPolling.value) {
      startPolling(callback, intervalMs);
    } else {
      pollingInterval.value = intervalMs;
    }
  };

  onUnmounted(() => {
    stopPolling();
  });

  return {
    isPolling,
    nextUpdateTime,
    pollingInterval,
    startPolling,
    stopPolling,
    getTimeRemaining,
    updateInterval,
  };
}
