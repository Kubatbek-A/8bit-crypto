import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { ref } from "vue";
import { useCurrenciesStore } from "../modules/currencies";
import type { MarketDataItem } from "../../types";

// Mock API
vi.mock("../../composables/useApi", () => ({
  useApi: () => ({
    fetchData: vi.fn(),
  }),
}));

// Mock localStorage
vi.mock("../../composables/useLocalStorage", () => ({
  useLocalStorage: () => ({
    value: ref("Aud"),
  }),
}));

describe("useCurrenciesStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useCurrenciesStore();

      expect(Array.isArray(store.currencies)).toBe(true);
      expect(store.currencies.length).toBeGreaterThan(0);
      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
      expect(store.lastUpdate).toBe(null);
      expect(store.selectedCurrency).toBe("Aud");
    });
  });

  describe("computed properties", () => {
    it("should have primaryCurrencies computed property", () => {
      const store = useCurrenciesStore();

      expect(Array.isArray(store.primaryCurrencies)).toBe(true);
      expect(store.primaryCurrencies.every((c) => c.type === "Primary")).toBe(
        true
      );
    });

    it("should have secondaryCurrencies computed property", () => {
      const store = useCurrenciesStore();

      expect(Array.isArray(store.secondaryCurrencies)).toBe(true);
      expect(
        store.secondaryCurrencies.every((c) => c.type === "Secondary")
      ).toBe(true);
    });

    it("should have selectedCurrencyInfo computed property", () => {
      const store = useCurrenciesStore();

      expect(store.selectedCurrencyInfo).toBeDefined();
      if (store.selectedCurrencyInfo) {
        expect(store.selectedCurrencyInfo.code).toBe("Aud");
      }
    });
  });

  describe("getCurrencyInfo", () => {
    it("should return currency info by code", () => {
      const store = useCurrenciesStore();

      const result = store.getCurrencyInfo("Aud");
      expect(result).toBeDefined();
      expect(result?.code).toBe("Aud");
    });

    it("should return undefined for non-existent currency", () => {
      const store = useCurrenciesStore();

      const result = store.getCurrencyInfo("non-existent");
      expect(result).toBeUndefined();
    });

    it("should be case insensitive", () => {
      const store = useCurrenciesStore();

      const result1 = store.getCurrencyInfo("aud");
      const result2 = store.getCurrencyInfo("AUD");
      const result3 = store.getCurrencyInfo("Aud");

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });
  });

  describe("changeCurrency", () => {
    it("should change currency for valid secondary currency", () => {
      const store = useCurrenciesStore();

      const result = store.changeCurrency("Usd");
      expect(result).toBe(true);
      expect(store.selectedCurrency).toBe("Usd");
    });

    it("should not change currency for invalid currency", () => {
      const store = useCurrenciesStore();
      const originalCurrency = store.selectedCurrency;

      const result = store.changeCurrency("invalid");
      expect(result).toBe(false);
      expect(store.selectedCurrency).toBe(originalCurrency);
    });

    it("should not change currency for invalid currency", () => {
      const store = useCurrenciesStore();
      const originalCurrency = store.selectedCurrency;

      const result = store.changeCurrency("invalid");
      expect(result).toBe(false);
      expect(store.selectedCurrency).toBe(originalCurrency);
    });
  });

  describe("getAvailableSecondaryCurrencies", () => {
    it("should return currencies with market pairs", () => {
      const store = useCurrenciesStore();
      const mockMarketData: MarketDataItem[] = [
        {
          pair: { primary: "bitcoin", secondary: "Usd" },
          price: { last: "50000", change: { percent: "5.0", direction: "Up" } },
          volume: { primary: "1000", secondary: "50000000" },
        },
      ];

      const result = store.getAvailableSecondaryCurrencies(mockMarketData);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for no market data", () => {
      const store = useCurrenciesStore();

      const result = store.getAvailableSecondaryCurrencies([]);
      expect(result).toEqual([]);
    });
  });

  describe("getAvailableCurrenciesForCrypto", () => {
    it("should return currencies available for specific crypto", () => {
      const store = useCurrenciesStore();
      const mockMarketData: MarketDataItem[] = [
        {
          pair: { primary: "bitcoin", secondary: "Usd" },
          price: { last: "50000", change: { percent: "5.0", direction: "Up" } },
          volume: { primary: "1000", secondary: "50000000" },
        },
      ];

      const result = store.getAvailableCurrenciesForCrypto(
        "bitcoin",
        mockMarketData
      );
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for non-existent crypto", () => {
      const store = useCurrenciesStore();
      const mockMarketData: MarketDataItem[] = [
        {
          pair: { primary: "bitcoin", secondary: "Usd" },
          price: { last: "50000", change: { percent: "5.0", direction: "Up" } },
          volume: { primary: "1000", secondary: "50000000" },
        },
      ];

      const result = store.getAvailableCurrenciesForCrypto(
        "non-existent",
        mockMarketData
      );
      expect(result).toEqual([]);
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      const store = useCurrenciesStore();

      // Set an error first
      store.error = {
        message: "Test error",
        code: "TEST_ERROR",
        timestamp: new Date(),
      };

      store.clearError();
      expect(store.error).toBe(null);
    });
  });

  describe("reset", () => {
    it("should reset store to initial state", () => {
      const store = useCurrenciesStore();

      // Modify some state
      store.isLoading = true;
      store.error = {
        message: "Test error",
        code: "TEST_ERROR",
        timestamp: new Date(),
      };

      store.reset();

      expect(store.isLoading).toBe(false);
      expect(store.error).toBe(null);
      expect(store.lastUpdate).toBe(null);
      expect(store.selectedCurrency).toBe("Aud");
    });
  });

  describe("fetchCurrencies", () => {
    it("should be a function", () => {
      const store = useCurrenciesStore();

      expect(typeof store.fetchCurrencies).toBe("function");
    });
  });
});
