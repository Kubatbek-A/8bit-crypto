import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useErrorHandler, type ErrorInfo } from "../useErrorHandler";
import type { ApiError } from "../../types";

describe("useErrorHandler", () => {
  let errorHandler: ReturnType<typeof useErrorHandler>;

  beforeEach(() => {
    vi.clearAllMocks();
    errorHandler = useErrorHandler();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should add and get error", () => {
    const error: ApiError = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("test-key", error);
    const storedError = errorHandler.getError("test-key");

    expect(storedError).toBeDefined();
    expect(storedError?.message).toBe("Test error");
    expect(storedError?.code).toBe("TEST_ERROR");
  });

  it("should remove error", () => {
    const error: ApiError = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("test-key", error);
    expect(errorHandler.getError("test-key")).toBeDefined();

    errorHandler.removeError("test-key");
    expect(errorHandler.getError("test-key")).toBeUndefined();
  });

  it("should clear all errors", () => {
    const error1: ApiError = {
      message: "First error",
      code: "FIRST_ERROR",
      timestamp: new Date(),
    };

    const error2: ApiError = {
      message: "Second error",
      code: "SECOND_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("key1", error1);
    errorHandler.addError("key2", error2);

    expect(errorHandler.errorCount.value).toBe(2);

    errorHandler.clearErrors();
    expect(errorHandler.errorCount.value).toBe(0);
  });

  it("should track error count", () => {
    expect(errorHandler.errorCount.value).toBe(0);

    const error: ApiError = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("test-key", error);
    expect(errorHandler.errorCount.value).toBe(1);

    errorHandler.removeError("test-key");
    expect(errorHandler.errorCount.value).toBe(0);
  });

  it("should track hasErrors state", () => {
    expect(errorHandler.hasErrors.value).toBe(false);

    const error: ApiError = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("test-key", error);
    expect(errorHandler.hasErrors.value).toBe(true);

    errorHandler.removeError("test-key");
    expect(errorHandler.hasErrors.value).toBe(false);
  });

  it("should get all errors", () => {
    const error1: ApiError = {
      message: "First error",
      code: "FIRST_ERROR",
      timestamp: new Date(),
    };

    const error2: ApiError = {
      message: "Second error",
      code: "SECOND_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("key1", error1);
    errorHandler.addError("key2", error2);

    const allErrors = errorHandler.allErrors.value;
    expect(allErrors.length).toBe(2);
  });

  it("should format error message", () => {
    const error: ErrorInfo = {
      message: "Test error message",
      code: "TEST_ERROR",
      timestamp: new Date(),
      retryable: false,
    };

    const formatted = errorHandler.formatErrorMessage(error);
    expect(formatted).toBe("Test error message");
  });

  it("should handle null error in formatErrorMessage", () => {
    const formatted = errorHandler.formatErrorMessage(
      null as unknown as ErrorInfo
    );
    expect(formatted).toBe("Unknown error occurred");
  });

  it("should get user friendly message", () => {
    const error: ApiError = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("test-key", error);
    const message = errorHandler.getUserFriendlyMessage("test-key");

    expect(message).toBe("Test error");
  });

  it("should check if error is retryable", () => {
    const networkError: ApiError = {
      message: "Network error",
      code: "NETWORK_ERROR",
      timestamp: new Date(),
    };

    const nonRetryableError: ApiError = {
      message: "Validation error",
      code: "VALIDATION_ERROR",
      timestamp: new Date(),
    };

    expect(errorHandler.isRetryableError(networkError)).toBe(true);
    expect(errorHandler.isRetryableError(nonRetryableError)).toBe(false);
  });

  it("should cleanup on unmount", () => {
    const error: ApiError = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    errorHandler.addError("test-key", error);
    expect(errorHandler.errorCount.value).toBe(1);

    errorHandler.cleanup();
    expect(errorHandler.errorCount.value).toBe(0);
  });
});
