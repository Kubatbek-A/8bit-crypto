import { describe, it, expect, beforeEach } from "vitest";
import { useFormatters } from "../useFormatters";

describe("useFormatters", () => {
  let formatters: ReturnType<typeof useFormatters>;

  beforeEach(() => {
    formatters = useFormatters();
  });

  it("should format price correctly", () => {
    expect(formatters.formatPrice(1234.5678, 2)).toBe("1,234.57");
    expect(formatters.formatPrice(0.123456, 4)).toBe("0.1235");
    expect(formatters.formatPrice(1000000, 2)).toBe("1,000,000.00");
  });

  it("should format negative prices", () => {
    expect(formatters.formatPrice(-1234.5678, 2)).toBe("-1,234.57");
    expect(formatters.formatPrice(-0.123456, 4)).toBe("-0.1235");
  });

  it("should handle invalid price inputs", () => {
    expect(formatters.formatPrice(null)).toBe("0.00");
    expect(formatters.formatPrice(undefined)).toBe("0.00");
    expect(formatters.formatPrice("")).toBe("0.00");
    expect(formatters.formatPrice("invalid")).toBe("0.00");
    expect(formatters.formatPrice(NaN)).toBe("0.00");
  });

  it("should format volume with M suffix", () => {
    expect(formatters.formatVolume(1500000)).toBe("1.5M");
    expect(formatters.formatVolume(2000000)).toBe("2.0M");
    expect(formatters.formatVolume(1000000)).toBe("1.0M");
  });

  it("should format volume with K suffix", () => {
    expect(formatters.formatVolume(1500)).toBe("1.5K");
    expect(formatters.formatVolume(2000)).toBe("2.0K");
    expect(formatters.formatVolume(1000)).toBe("1.0K");
  });

  it("should format small volume without suffix", () => {
    expect(formatters.formatVolume(999)).toBe("999.00");
    expect(formatters.formatVolume(500)).toBe("500.00");
    expect(formatters.formatVolume(0)).toBe("0.00");
  });

  it("should handle invalid volume inputs", () => {
    expect(formatters.formatVolume(null)).toBe("0");
    expect(formatters.formatVolume(undefined)).toBe("0");
    expect(formatters.formatVolume("")).toBe("0");
    expect(formatters.formatVolume("invalid")).toBe("0");
    expect(formatters.formatVolume(NaN)).toBe("0");
  });

  it("should get correct decimal places", () => {
    expect(formatters.getDecimalPlaces(2000)).toBe(2); // > 1000
    expect(formatters.getDecimalPlaces(100)).toBe(4); // > 1
    expect(formatters.getDecimalPlaces(0.1)).toBe(5); // > 0.01
    expect(formatters.getDecimalPlaces(0.001)).toBe(8); // <= 0.01
  });

  it("should format percentage with correct sign", () => {
    expect(formatters.formatPercentage("5.25", "Up")).toBe("+5.25%");
    expect(formatters.formatPercentage("3.75", "Down")).toBe("-3.75%");
    expect(formatters.formatPercentage("0", "Up")).toBe("+0%");
  });

  it("should format time correctly", () => {
    const timestamp = 1640995200; // 2022-01-01 00:00:00 UTC
    const result = formatters.formatTime(timestamp, false);
    expect(result).toMatch(/\d{2}:\d{2}/); // HH:MM format
  });

  it("should format time with date", () => {
    const timestamp = 1640995200; // 2022-01-01 00:00:00 UTC
    const result = formatters.formatTime(timestamp, true);
    expect(result).toMatch(/\d{2}:\d{2}/); // Should include time
  });

  it("should format chart time", () => {
    const timestamp = 1640995200; // 2022-01-01 00:00:00 UTC
    const result = formatters.formatChartTime(timestamp);
    expect(result).toMatch(/\d{2}:\d{2}/); // HH:MM format
  });

  it("should format currency pair", () => {
    expect(formatters.formatCurrencyPair("btc", "usd")).toBe("BTC/USD");
    expect(formatters.formatCurrencyPair("eth", "eur")).toBe("ETH/EUR");
  });

  it("should get consistent timezone", () => {
    const timezone = formatters.getConsistentTimezone();
    expect(typeof timezone).toBe("string");
    expect(timezone.length).toBeGreaterThan(0);
  });
});
