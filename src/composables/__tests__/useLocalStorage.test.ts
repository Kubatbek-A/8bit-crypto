import { describe, it, expect, beforeEach, vi } from "vitest";
import { useLocalStorage } from "../useLocalStorage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it("should initialize with default value", () => {
    const defaultValue = "default";
    const { value } = useLocalStorage("test-key", defaultValue);

    expect(value.value).toBe(defaultValue);
  });

  it("should reset to default value", () => {
    const defaultValue = "default";
    const { value, reset } = useLocalStorage("test-key", defaultValue);

    value.value = "changed";
    reset();

    expect(value.value).toBe(defaultValue);
  });

  it("should throw error for invalid key", () => {
    expect(() => useLocalStorage("", "default")).toThrow(
      "Storage key must be a non-empty string"
    );
    expect(() => useLocalStorage(null as any, "default")).toThrow(
      "Storage key must be a non-empty string"
    );
  });

  it("should handle localStorage errors gracefully", () => {
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("Storage error");
    });

    const { value } = useLocalStorage("test-key", "default");
    expect(value.value).toBe("default");
  });
});
