import { defineStore } from "pinia";
import { computed, type ComputedRef } from "vue";
import { useCurrenciesStore } from "@/stores/modules/currencies";
import { useMarketStore } from "@/stores/modules/market";
import type {
  CurrencyInfo,
  MarketDataItem,
  ApiError,
  SortField,
  SortOrder,
  Optional,
  Maybe,
  Nullable,
} from "@/types";

export const useCryptoStore = defineStore("crypto", () => {
  const currenciesStore = useCurrenciesStore();
  const marketStore = useMarketStore();

  const currencies: ComputedRef<CurrencyInfo[]> = computed(
    () => currenciesStore.currencies
  );
  const marketData: ComputedRef<MarketDataItem[]> = computed(
    () => marketStore.marketData
  );
  const loading: ComputedRef<boolean> = computed(
    () => marketStore.isLoading || currenciesStore.isLoading
  );
  const isInitialLoad: ComputedRef<boolean> = computed(
    () => marketStore.isInitialLoad
  );
  const error: ComputedRef<Nullable<ApiError>> = computed(
    () => marketStore.error || currenciesStore.error
  );
  const lastUpdate: ComputedRef<Nullable<Date>> = computed(
    () => marketStore.lastUpdate || currenciesStore.lastUpdate
  );
  const searchQuery: ComputedRef<string> = computed({
    get: () => marketStore.searchQuery,
    set: (value: string) => (marketStore.searchQuery = value),
  });
  const selectedType: ComputedRef<string> = computed({
    get: () => marketStore.selectedType,
    set: (value: string) => (marketStore.selectedType = value),
  });
  const sortBy: ComputedRef<SortField> = computed({
    get: () => marketStore.sortBy,
    set: (value: SortField) => (marketStore.sortBy = value),
  });
  const sortOrder: ComputedRef<SortOrder> = computed({
    get: () => marketStore.sortOrder,
    set: (value: SortOrder) => (marketStore.sortOrder = value),
  });
  const selectedCurrency: ComputedRef<string> = computed({
    get: () => currenciesStore.selectedCurrency,
    set: (value: string) => (currenciesStore.selectedCurrency = value),
  });
  const filteredMarketData: ComputedRef<MarketDataItem[]> = computed(
    () => marketStore.filteredMarketData
  );
  const isPolling: ComputedRef<boolean> = computed(() => marketStore.isPolling);
  const pollingInterval: ComputedRef<number> = computed(() => 10000);
  const nextUpdateTime: ComputedRef<Date | null> = computed(() => null);

  const fetchCurrencies = async (): Promise<boolean> => {
    return await currenciesStore.fetchCurrencies();
  };

  const fetchMarketData = async (
    isPollingUpdate: boolean = false
  ): Promise<boolean> => {
    return await marketStore.fetchMarketData(isPollingUpdate);
  };

  const getCurrencyInfo = (code: string): Optional<CurrencyInfo> => {
    return currenciesStore.getCurrencyInfo(code);
  };

  const formatPrice = (
    price: Maybe<string | number>,
    decimals: number = 2
  ): string => {
    return marketStore.formatPrice(price, decimals);
  };

  const formatVolume = (volume: Maybe<string | number>): string => {
    return marketStore.formatVolume(volume);
  };

  const getDecimalPlaces = (price: number): number => {
    if (price > 1000) return 2;
    if (price > 1) return 4;
    if (price > 0.01) return 5;
    return 8;
  };

  const getSecondaryCurrencies = (): CurrencyInfo[] => {
    return currenciesStore.secondaryCurrencies;
  };

  const changeCurrency = (currencyCode: string): boolean => {
    return currenciesStore.changeCurrency(currencyCode);
  };

  const getCryptoData = (
    primary: string,
    secondary?: string
  ): Optional<MarketDataItem> => {
    return marketStore.getCryptoData(primary, secondary);
  };

  const startPolling = (intervalMs: number = 10000): void => {
    marketStore.startRealTimePolling(intervalMs);
  };

  const stopPolling = (): void => {
    marketStore.stopRealTimePolling();
  };

  const startAutoRefresh = (intervalMs: number = 10000): void => {
    startPolling(intervalMs);
  };

  const stopAutoRefresh = (): void => {
    stopPolling();
  };

  const setSortBy = (field: SortField, order?: SortOrder): void => {
    marketStore.setSortBy(field, order);
  };

  return {
    currencies,
    marketData,
    loading,
    isInitialLoad,
    error,
    lastUpdate,
    searchQuery,
    selectedType,
    sortBy,
    sortOrder,
    selectedCurrency,
    isPolling,
    pollingInterval,
    nextUpdateTime,
    fetchCurrencies,
    fetchMarketData,
    startAutoRefresh,
    stopAutoRefresh,
    startPolling,
    stopPolling,
    changeCurrency,
    filteredMarketData,
    getCurrencyInfo,
    formatPrice,
    formatVolume,
    getDecimalPlaces,
    getSecondaryCurrencies,
    getCryptoData,
    setSortBy,
  };
});
