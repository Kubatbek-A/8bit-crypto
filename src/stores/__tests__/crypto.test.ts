import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useCryptoStore } from "../crypto";

// Mock stores
vi.mock("../modules/market", () => ({
  useMarketStore: () => ({
    marketData: [],
    isLoading: false,
    error: null,
    lastUpdate: null,
    getCryptoData: vi.fn(),
  }),
}));

vi.mock("../modules/currencies", () => ({
  useCurrenciesStore: () => ({
    currencies: [],
    isLoading: false,
    error: null,
    lastUpdate: null,
    getCurrencyInfo: vi.fn(),
  }),
}));

// Mock formatters
vi.mock("../../composables/useFormatters", () => ({
  useFormatters: () => ({
    formatPrice: vi.fn((price) => `$${price}`),
    formatVolume: vi.fn((volume) => `${volume}M`),
  }),
}));

describe("useCryptoStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const store = useCryptoStore();

      expect(Array.isArray(store.marketData)).toBe(true);
      expect(store.marketData).toEqual([]);
      expect(Array.isArray(store.currencies)).toBe(true);
      expect(store.currencies).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.error).toBe(null);
      expect(store.lastUpdate).toBe(null);
    });
  });

  describe("computed properties", () => {
    it("should have marketData computed property", () => {
      const store = useCryptoStore();

      expect(Array.isArray(store.marketData)).toBe(true);
    });

    it("should have currencies computed property", () => {
      const store = useCryptoStore();

      expect(Array.isArray(store.currencies)).toBe(true);
    });

    it("should have loading computed property", () => {
      const store = useCryptoStore();

      expect(typeof store.loading).toBe("boolean");
    });

    it("should have error computed property", () => {
      const store = useCryptoStore();

      expect(store.error).toBe(null);
    });

    it("should have lastUpdate computed property", () => {
      const store = useCryptoStore();

      expect(store.lastUpdate).toBe(null);
    });
  });

  describe("getCurrencyInfo", () => {
    it("should be a function", () => {
      const store = useCryptoStore();

      expect(typeof store.getCurrencyInfo).toBe("function");
    });
  });

  describe("formatPrice", () => {
    it("should be a function", () => {
      const store = useCryptoStore();

      expect(typeof store.formatPrice).toBe("function");
    });
  });

  describe("formatVolume", () => {
    it("should be a function", () => {
      const store = useCryptoStore();

      expect(typeof store.formatVolume).toBe("function");
    });
  });

  describe("getCryptoData", () => {
    it("should be a function", () => {
      const store = useCryptoStore();

      expect(typeof store.getCryptoData).toBe("function");
    });
  });
});
