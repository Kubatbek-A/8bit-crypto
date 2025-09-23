import { ref, computed, type Ref, type ComputedRef } from "vue";
import type { ApiError, Optional } from "@/types";

interface ErrorInfo {
  message: string;
  code: string;
  timestamp: Date;
  stack?: string;
  retryable: boolean;
  status?: number;
}

export function useErrorHandler() {
  const errors: Ref<Map<string, ErrorInfo>> = ref(new Map());
  const isOnline: Ref<boolean> = ref(navigator.onLine);

  const addError = (
    key: string,
    error: Error | ApiError | Record<string, unknown>
  ): void => {
    const errorInfo: ErrorInfo = {
      message:
        error instanceof Error
          ? error.message
          : ((error as Record<string, unknown>).message as string) ||
            String(error),
      code:
        ((error as ApiError | Record<string, unknown>).code as string) ||
        "UNKNOWN_ERROR",
      timestamp: new Date(),
      retryable: isRetryableError(error),
    };

    const stackValue =
      error instanceof Error
        ? error.stack
        : ((error as Record<string, unknown>).stack as string);
    if (stackValue) {
      errorInfo.stack = stackValue;
    }

    const statusValue = (error as ApiError | Record<string, unknown>)
      .status as number;
    if (statusValue !== undefined) {
      errorInfo.status = statusValue;
    }

    errors.value.set(key, errorInfo);
  };

  const removeError = (key: string): void => {
    errors.value.delete(key);
  };

  const clearErrors = (): void => {
    errors.value.clear();
  };

  const getError = (key: string): Optional<ErrorInfo> => {
    return errors.value.get(key);
  };

  const isRetryableError = (
    error: Error | ApiError | Record<string, unknown>
  ): boolean => {
    const retryableCodes = [
      "NETWORK_ERROR",
      "TIMEOUT_ERROR",
      "SERVER_ERROR",
      "ECONNABORTED",
    ];

    const retryableStatuses = [408, 429, 500, 502, 503, 504];

    const errorCode = (error as ApiError | Record<string, unknown>)
      .code as string;
    const errorStatus = (error as ApiError | Record<string, unknown>)
      .status as number;

    return (
      retryableCodes.includes(errorCode) ||
      retryableStatuses.includes(errorStatus) ||
      !isOnline.value
    );
  };

  const formatErrorMessage = (error: Optional<ErrorInfo>): string => {
    if (!error) return "Unknown error occurred";

    if (!isOnline.value) {
      return "No internet connection. Please check your network and try again.";
    }

    if (error.code === "NETWORK_ERROR" || error.code === "ECONNABORTED") {
      return "Network error. Please check your connection and try again.";
    }

    if (error.code === "TIMEOUT_ERROR") {
      return "Request timed out. Please try again.";
    }

    if (error.status && error.status >= 500) {
      return "Server error. Please try again later.";
    }

    if (error.status && error.status === 404) {
      return "Requested resource not found.";
    }

    if (error.status && error.status === 429) {
      return "Too many requests. Please wait a moment and try again.";
    }

    return error.message || "An unexpected error occurred";
  };

  const getUserFriendlyMessage = (key: string): string => {
    const error = getError(key);
    return formatErrorMessage(error);
  };

  const hasErrors: ComputedRef<boolean> = computed(() => errors.value.size > 0);
  const errorCount: ComputedRef<number> = computed(() => errors.value.size);
  const allErrors: ComputedRef<[string, ErrorInfo][]> = computed(() =>
    Array.from(errors.value.entries())
  );
  const retryableErrors: ComputedRef<[string, ErrorInfo][]> = computed(() =>
    allErrors.value.filter(([, error]) => error.retryable)
  );

  const handleOnline = (): void => {
    isOnline.value = true;
  };

  const handleOffline = (): void => {
    isOnline.value = false;
    addError("network", {
      message: "Internet connection lost",
      code: "NETWORK_OFFLINE",
    });
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
  }

  const cleanup = (): void => {
    if (typeof window !== "undefined") {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    }
    clearErrors();
  };

  return {
    errors,
    isOnline,

    hasErrors,
    errorCount,
    allErrors,
    retryableErrors,

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
