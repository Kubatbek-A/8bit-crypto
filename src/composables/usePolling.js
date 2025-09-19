import { ref, onUnmounted } from "vue";
import { POLLING_CONFIG } from "../constants/api.js";

export function usePolling() {
  const isPolling = ref(false);
  const nextUpdateTime = ref(null);
  const pollingInterval = ref(POLLING_CONFIG.INTERVAL);

  let refreshInterval = null;
  let countdownInterval = null;

  const startPolling = (callback, intervalMs = POLLING_CONFIG.INTERVAL) => {
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
        const timeLeft = nextUpdateTime.value - now;
        if (timeLeft <= 0) {
          nextUpdateTime.value = new Date(Date.now() + intervalMs);
        }
      }
    }, POLLING_CONFIG.COUNTDOWN_INTERVAL);
  };

  const stopPolling = () => {
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

  const getTimeRemaining = () => {
    if (!nextUpdateTime.value) return 0;
    const now = new Date();
    const timeLeft = Math.max(
      0,
      Math.floor((nextUpdateTime.value - now) / 1000)
    );
    return timeLeft;
  };

  const updateInterval = (intervalMs, callback) => {
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
