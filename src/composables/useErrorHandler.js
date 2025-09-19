import { ref, computed } from "vue";

export function useErrorHandler() {
  const errors = ref(new Map());
  const isOnline = ref(navigator.onLine);

  /**
   * Add error to the error map
   * @param {string} key - Error key/identifier
   * @param {Error|Object} error - Error object or error details
   */
  const addError = (key, error) => {
    const errorInfo = {
      message: error.message || error.toString(),
      code: error.code || "UNKNOWN_ERROR",
      timestamp: new Date(),
      stack: error.stack,
      retryable: isRetryableError(error),
    };

    errors.value.set(key, errorInfo);
  };

  /**
   * Remove error from the error map
   * @param {string} key - Error key to remove
   */
  const removeError = (key) => {
    errors.value.delete(key);
  };

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errors.value.clear();
  };

  /**
   * Get error by key
   * @param {string} key - Error key
   * @returns {Object|undefined} Error information
   */
  const getError = (key) => {
    return errors.value.get(key);
  };

  /**
   * Check if error is retryable
   * @param {Error|Object} error - Error to check
   * @returns {boolean} True if error is retryable
   */
  const isRetryableError = (error) => {
    const retryableCodes = [
      "NETWORK_ERROR",
      "TIMEOUT_ERROR",
      "SERVER_ERROR",
      "ECONNABORTED",
    ];

    const retryableStatuses = [408, 429, 500, 502, 503, 504];

    return (
      retryableCodes.includes(error.code) ||
      retryableStatuses.includes(error.status) ||
      !isOnline.value
    );
  };

  /**
   * Format error message for display
   * @param {Object} error - Error object
   * @returns {string} Formatted error message
   */
  const formatErrorMessage = (error) => {
    if (!error) return "Unknown error occurred";

    // Network-related errors
    if (!isOnline.value) {
      return "No internet connection. Please check your network and try again.";
    }

    if (error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED") {
      return "Network error. Please check your connection and try again.";
    }

    if (error.code === "TIMEOUT_ERROR") {
      return "Request timed out. Please try again.";
    }

    // API-related errors
    if (error.status >= 500) {
      return "Server error. Please try again later.";
    }

    if (error.status === 404) {
      return "Requested resource not found.";
    }

    if (error.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }

    // Default to error message
    return error.message || "An unexpected error occurred";
  };

  /**
   * Get user-friendly error message
   * @param {string} key - Error key
   * @returns {string} User-friendly error message
   */
  const getUserFriendlyMessage = (key) => {
    const error = getError(key);
    return formatErrorMessage(error);
  };

  // Computed properties
  const hasErrors = computed(() => errors.value.size > 0);
  const errorCount = computed(() => errors.value.size);
  const allErrors = computed(() => Array.from(errors.value.entries()));
  const retryableErrors = computed(() =>
    allErrors.value.filter(([key, error]) => error.retryable)
  );

  // Network status handling
  const handleOnline = () => {
    isOnline.value = true;
  };

  const handleOffline = () => {
    isOnline.value = false;
    addError("network", {
      message: "Internet connection lost",
      code: "NETWORK_OFFLINE",
    });
  };

  // Setup network listeners
  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  /**
   * Cleanup function
   */
  const cleanup = () => {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
    clearErrors();
  };

  return {
    // State
    errors,
    isOnline,

    // Computed
    hasErrors,
    errorCount,
    allErrors,
    retryableErrors,

    // Methods
    addError,
    removeError,
    clearErrors,
    getError,
    isRetryableError,
    formatErrorMessage,
    getUserFriendlyMessage,
    cleanup,
  };
}
