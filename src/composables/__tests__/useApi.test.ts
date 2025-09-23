import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useApi } from "../useApi";

// Mock axios
vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => ({
      request: vi.fn(),
    })),
  },
}));

describe("useApi", () => {
  let api: ReturnType<typeof useApi>;

  beforeEach(() => {
    vi.clearAllMocks();
    api = useApi();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should have correct initial state", () => {
    expect(api.isLoading.value).toBe(false);
    expect(api.error.value).toBe(null);
  });

  it("should have required methods", () => {
    expect(typeof api.makeRequest).toBe("function");
    expect(typeof api.fetchData).toBe("function");
    expect(typeof api.clearError).toBe("function");
  });

  it("should clear error", () => {
    api.error.value = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    api.clearError();
    expect(api.error.value).toBe(null);
  });

  it("should allow setting error state", () => {
    const testError = {
      message: "Test error",
      code: "TEST_ERROR",
      timestamp: new Date(),
    };

    api.error.value = testError;
    expect(api.error.value).toEqual(testError);
  });

  it("should allow setting loading state", () => {
    api.isLoading.value = true;
    expect(api.isLoading.value).toBe(true);

    api.isLoading.value = false;
    expect(api.isLoading.value).toBe(false);
  });
});
