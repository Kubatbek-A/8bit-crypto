import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useMarketStore } from "../modules/market";
import type { MarketDataItem } from "../../types";

// Mock API
vi.mock("../../composables/useApi", () => ({
  useApi: () => ({
    fetchData: vi.fn(),
  }),
}));

// Mock polling
vi.mock("../../composables/usePolling", () => ({
  usePolling: () => ({
    startPolling: vi.fn(),
    stopPolling: vi.fn(),
    isPolling: { value: false },
  }),
}));

// Mock formatters
vi.mock("../../composables/useFormatters", () => ({
  useFormatters: () => ({
    formatPrice: vi.fn((price) => `$${price}`),
    formatVolume: vi.fn((volume) => `${volume}M`),
  }),
}));

// Mock currencies store
vi.mock("../modules/currencies", () => ({
  useCurrenciesStore: () => ({
    selectedCurrency: "Aud",
    getCurrencyInfo: vi.fn((code) => ({
      code,
      ticker: code.toUpperCase(),
      type: "crypto",
    })),
  }),
}));

describe("useMarketStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useMarketStore();

      expect(Array.isArray(store.marketData)).toBe(true);
      expect(store.marketData).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.isInitialLoad).toBe(true);
      expect(store.error).toBe(null);
      expect(store.lastUpdate).toBe(null);
      expect(store.searchQuery).toBe("");
      expect(store.selectedType).toBe("all");
      expect(store.sortBy).toBe("name");
      expect(store.sortOrder).toBe("asc");
    });
  });

  describe("computed properties", () => {
    it("should have filteredMarketData computed property", () => {
      const store = useMarketStore();

      expect(Array.isArray(store.filteredMarketData)).toBe(true);
      expect(store.filteredMarketData).toEqual([]);
    });

    it("should have marketTrend computed property", () => {
      const store = useMarketStore();

      expect(store.marketTrend).toBe("N/A");
    });

    it("should have marketStats computed property", () => {
      const store = useMarketStore();

      expect(store.marketStats).toBeDefined();
      expect(store.marketStats.totalPairs).toBe(0);
      expect(store.marketStats.totalVolume).toBe("0");
      expect(store.marketStats.avgChange).toBe("0.00");
      expect(store.marketStats.topGainer).toBe(null);
      expect(store.marketStats.topLoser).toBe(null);
    });
  });

  describe("getCryptoData", () => {
    it("should return crypto data by primary and secondary", () => {
      const store = useMarketStore();
      const mockData: MarketDataItem[] = [
        {
          pair: { primary: "bitcoin", secondary: "Aud" },
          price: { last: "50000", change: { percent: "5.0", direction: "Up" } },
          volume: { primary: "1000", secondary: "50000000" },
        },
      ];

      store.marketData = mockData;

      const result = store.getCryptoData("bitcoin", "Aud");
      expect(result).toEqual(mockData[0]);
    });

    it("should return null for non-existent crypto", () => {
      const store = useMarketStore();
      const mockData: MarketDataItem[] = [
        {
          pair: { primary: "bitcoin", secondary: "Aud" },
          price: { last: "50000", change: { percent: "5.0", direction: "Up" } },
          volume: { primary: "1000", secondary: "50000000" },
        },
      ];

      store.marketData = mockData;

      const result = store.getCryptoData("non-existent", "Aud");
      expect(result).toBeUndefined();
    });

    it("should use default secondary currency when not provided", () => {
      const store = useMarketStore();
      const mockData: MarketDataItem[] = [
        {
          pair: { primary: "bitcoin", secondary: "Aud" },
          price: { last: "50000", change: { percent: "5.0", direction: "Up" } },
          volume: { primary: "1000", secondary: "50000000" },
        },
      ];

      store.marketData = mockData;

      const result = store.getCryptoData("bitcoin");
      expect(result).toEqual(mockData[0]);
    });
  });

  describe("setSortBy", () => {
    it("should set sort field and order", () => {
      const store = useMarketStore();

      store.setSortBy("price", "desc");
      expect(store.sortBy).toBe("price");
      expect(store.sortOrder).toBe("desc");
    });

    it("should toggle order when same field is set", () => {
      const store = useMarketStore();

      store.setSortBy("name", "asc");
      expect(store.sortBy).toBe("name");
      expect(store.sortOrder).toBe("asc");

      store.setSortBy("name");
      expect(store.sortBy).toBe("name");
      expect(store.sortOrder).toBe("desc");
    });

    it("should use default order for price field", () => {
      const store = useMarketStore();

      store.setSortBy("price");
      expect(store.sortBy).toBe("price");
      expect(store.sortOrder).toBe("desc");
    });

    it("should use default order for volume field", () => {
      const store = useMarketStore();

      store.setSortBy("volume");
      expect(store.sortBy).toBe("volume");
      expect(store.sortOrder).toBe("desc");
    });

    it("should use default order for change field", () => {
      const store = useMarketStore();

      store.setSortBy("change");
      expect(store.sortBy).toBe("change");
      expect(store.sortOrder).toBe("desc");
    });

    it("should use asc order for name field", () => {
      const store = useMarketStore();

      // Reset to different field first
      store.setSortBy("price");
      store.setSortBy("name");
      expect(store.sortBy).toBe("name");
      expect(store.sortOrder).toBe("asc");
    });
  });

  describe("clearSearch", () => {
    it("should clear search query", () => {
      const store = useMarketStore();

      store.searchQuery = "bitcoin";
      store.clearSearch();
      expect(store.searchQuery).toBe("");
    });
  });

  describe("clearError", () => {
    it("should clear error state", () => {
      const store = useMarketStore();

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
      const store = useMarketStore();

      // Modify some state
      store.marketData = [
        {
          pair: { primary: "bitcoin", secondary: "Aud" },
          price: { last: "50000", change: { percent: "5.0", direction: "Up" } },
          volume: { primary: "1000", secondary: "50000000" },
        },
      ];
      store.isLoading = true;
      store.isInitialLoad = false;
      store.error = {
        message: "Test error",
        code: "TEST_ERROR",
        timestamp: new Date(),
      };
      store.searchQuery = "bitcoin";
      store.selectedType = "crypto";
      store.sortBy = "price";
      store.sortOrder = "desc";

      store.reset();

      expect(store.marketData).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.isInitialLoad).toBe(true);
      expect(store.error).toBe(null);
      expect(store.lastUpdate).toBe(null);
      expect(store.searchQuery).toBe("");
      expect(store.selectedType).toBe("all");
      expect(store.sortBy).toBe("name");
      expect(store.sortOrder).toBe("asc");
    });
  });

  describe("polling methods", () => {
    it("should have startRealTimePolling method", () => {
      const store = useMarketStore();

      expect(typeof store.startRealTimePolling).toBe("function");
    });

    it("should have stopRealTimePolling method", () => {
      const store = useMarketStore();

      expect(typeof store.stopRealTimePolling).toBe("function");
    });
  });

  describe("fetchMarketData", () => {
    it("should be a function", () => {
      const store = useMarketStore();

      expect(typeof store.fetchMarketData).toBe("function");
    });
  });

  describe("formatPrice and formatVolume", () => {
    it("should have formatPrice method", () => {
      const store = useMarketStore();

      expect(typeof store.formatPrice).toBe("function");
    });

    it("should have formatVolume method", () => {
      const store = useMarketStore();

      expect(typeof store.formatVolume).toBe("function");
    });
  });
});
