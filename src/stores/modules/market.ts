import { ref, computed, type Ref, type ComputedRef } from "vue";
import { defineStore } from "pinia";
import { API_ENDPOINTS } from "@/constants/api";
import { useApi } from "@/composables/useApi";
import { usePolling } from "@/composables/usePolling";
import { useFormatters } from "@/composables/useFormatters";
import { useCurrenciesStore } from "@/stores/modules/currencies";
import type {
  MarketDataItem,
  ApiError,
  MarketStats,
  SortField,
  SortOrder,
  Optional,
  Nullable,
} from "@/types";

export const useMarketStore = defineStore("market", () => {
  const { fetchData } = useApi();
  const { startPolling, stopPolling, isPolling } = usePolling();
  const { formatPrice, formatVolume } = useFormatters();
  const currenciesStore = useCurrenciesStore();

  const marketData: Ref<MarketDataItem[]> = ref([]);
  const isLoading: Ref<boolean> = ref(false);
  const isInitialLoad: Ref<boolean> = ref(true);
  const error: Ref<Nullable<ApiError>> = ref(null);
  const lastUpdate: Ref<Nullable<Date>> = ref(null);
  const searchQuery: Ref<string> = ref("");
  const selectedType: Ref<string> = ref("all");
  const sortBy: Ref<SortField> = ref("name");
  const sortOrder: Ref<SortOrder> = ref("asc");

  const filteredMarketData: ComputedRef<MarketDataItem[]> = computed(() => {
    let filtered = marketData.value;

    filtered = filtered.filter(
      (item) => item.pair.secondary === currenciesStore.selectedCurrency
    );

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter((item) => {
        const primary = currenciesStore.getCurrencyInfo(item.pair.primary);
        return (
          primary?.ticker?.toLowerCase().includes(query) ||
          primary?.code?.toLowerCase().includes(query) ||
          item.pair.primary.toLowerCase().includes(query)
        );
      });
    }

    if (selectedType.value !== "all") {
      filtered = filtered.filter((item) => {
        const primaryInfo = currenciesStore.getCurrencyInfo(item.pair.primary);
        return (
          primaryInfo?.type?.toLowerCase() === selectedType.value.toLowerCase()
        );
      });
    }

    return sortMarketData(filtered);
  });

  const marketTrend: ComputedRef<string> = computed(() => {
    if (marketData.value.length === 0) return "N/A";

    const upCount = marketData.value.filter(
      (item) => item.price.change.direction === "Up"
    ).length;

    const downCount = marketData.value.length - upCount;

    if (upCount > downCount) return "Bullish";
    if (downCount > upCount) return "Bearish";
    return "Mixed";
  });

  const marketStats: ComputedRef<MarketStats> = computed(() => {
    const data = filteredMarketData.value;

    if (data.length === 0) {
      return {
        totalPairs: 0,
        totalVolume: "0",
        avgChange: "0.00",
        topGainer: null,
        topLoser: null,
      };
    }

    const totalVolume = data.reduce(
      (sum, item) => sum + parseFloat(item.volume.secondary || "0"),
      0
    );

    const changes = data.map((item) => {
      const change = parseFloat(item.price.change.percent);
      return item.price.change.direction === "Up" ? change : -change;
    });

    const avgChange =
      changes.reduce((sum, change) => sum + change, 0) / changes.length;

    const sortedByChange = [...data].sort((a, b) => {
      const aChange =
        parseFloat(a.price.change.percent) *
        (a.price.change.direction === "Up" ? 1 : -1);
      const bChange =
        parseFloat(b.price.change.percent) *
        (b.price.change.direction === "Up" ? 1 : -1);
      return bChange - aChange;
    });

    return {
      totalPairs: data.length,
      totalVolume: formatVolume(totalVolume),
      avgChange: avgChange.toFixed(2),
      topGainer: sortedByChange[0] || null,
      topLoser: sortedByChange[sortedByChange.length - 1] || null,
    };
  });

  const sortMarketData = (data: MarketDataItem[]): MarketDataItem[] => {
    return [...data].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy.value) {
        case "name":
          aValue = (
            currenciesStore.getCurrencyInfo(a.pair.primary)?.ticker ||
            a.pair.primary
          ).toUpperCase();
          bValue = (
            currenciesStore.getCurrencyInfo(b.pair.primary)?.ticker ||
            b.pair.primary
          ).toUpperCase();
          break;
        case "price":
          aValue = parseFloat(a.price.last);
          bValue = parseFloat(b.price.last);
          break;
        case "change":
          aValue =
            parseFloat(a.price.change.percent) *
            (a.price.change.direction === "Up" ? 1 : -1);
          bValue =
            parseFloat(b.price.change.percent) *
            (b.price.change.direction === "Up" ? 1 : -1);
          break;
        case "volume":
          aValue = parseFloat(a.volume.secondary);
          bValue = parseFloat(b.volume.secondary);
          break;
        default:
          aValue = (
            currenciesStore.getCurrencyInfo(a.pair.primary)?.ticker ||
            a.pair.primary
          ).toUpperCase();
          bValue = (
            currenciesStore.getCurrencyInfo(b.pair.primary)?.ticker ||
            b.pair.primary
          ).toUpperCase();
      }

      if (typeof aValue === "string") {
        return sortOrder.value === "asc"
          ? aValue.localeCompare(String(bValue))
          : String(bValue).localeCompare(aValue);
      } else {
        return sortOrder.value === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }
    });
  };

  const fetchMarketData = async (
    isPollingUpdate: boolean = false
  ): Promise<boolean> => {
    try {
      if (!isPollingUpdate) {
        isLoading.value = true;
      }
      error.value = null;

      const newData = await fetchData<MarketDataItem[]>(API_ENDPOINTS.MARKET);

      if (newData) {
        const currentDataString = JSON.stringify(marketData.value);
        const newDataString = JSON.stringify(newData);

        if (currentDataString !== newDataString) {
          marketData.value = newData;
          lastUpdate.value = new Date();
          console.log("Market data updated:", newData.length, "pairs loaded");
        }

        return true;
      } else {
        console.warn("No market data received from API");
        marketData.value = [];
        return false;
      }
    } catch (err) {
      console.error("Failed to fetch market data:", err);
      error.value = {
        message: "Failed to load market data",
        code: "MARKET_FETCH_ERROR",
        timestamp: new Date(),
      };
      return false;
    } finally {
      if (!isPollingUpdate) {
        isLoading.value = false;
      }
      isInitialLoad.value = false;
    }
  };

  const getCryptoData = (
    primary: string,
    secondary?: string
  ): Optional<MarketDataItem> => {
    const targetSecondary = secondary || currenciesStore.selectedCurrency;
    return marketData.value.find(
      (item) =>
        item.pair.primary.toLowerCase() === primary.toLowerCase() &&
        item.pair.secondary === targetSecondary
    );
  };

  const startRealTimePolling = (intervalMs: number = 10000): void => {
    startPolling(async () => {
      await fetchMarketData(true);
    }, intervalMs);
  };

  const stopRealTimePolling = (): void => {
    stopPolling();
  };

  const setSortBy = (field: SortField, order?: SortOrder): void => {
    if (sortBy.value === field && !order) {
      sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
    } else {
      sortBy.value = field;
      if (order) {
        sortOrder.value = order;
      } else {
        if (field === "price" || field === "volume") {
          sortOrder.value = "desc";
        } else if (field === "change") {
          sortOrder.value = "desc";
        } else {
          sortOrder.value = "asc";
        }
      }
    }
  };

  const clearSearch = (): void => {
    searchQuery.value = "";
  };

  const clearError = (): void => {
    error.value = null;
  };

  const reset = (): void => {
    marketData.value = [];
    isLoading.value = false;
    isInitialLoad.value = true;
    error.value = null;
    lastUpdate.value = null;
    searchQuery.value = "";
    selectedType.value = "all";
    sortBy.value = "name";
    sortOrder.value = "asc";
    stopRealTimePolling();
  };

  return {
    marketData,
    isLoading,
    isInitialLoad,
    error,
    lastUpdate,
    searchQuery,
    selectedType,
    sortBy,
    sortOrder,
    isPolling,

    filteredMarketData,
    marketTrend,
    marketStats,

    fetchMarketData,
    getCryptoData,
    startRealTimePolling,
    stopRealTimePolling,
    setSortBy,
    clearSearch,
    clearError,
    reset,

    formatPrice,
    formatVolume,
  };
});
