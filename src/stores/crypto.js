import { defineStore } from "pinia";
import { computed } from "vue";
import { useCurrenciesStore } from "./modules/currencies.js";
import { useMarketStore } from "./modules/market.js";

export const useCryptoStore = defineStore("crypto", () => {
  const currenciesStore = useCurrenciesStore();
  const marketStore = useMarketStore();

  const currencies = computed(() => currenciesStore.currencies);
  const marketData = computed(() => marketStore.marketData);
  const loading = computed(
    () => marketStore.isLoading || currenciesStore.isLoading
  );
  const isInitialLoad = computed(() => marketStore.isInitialLoad);
  const error = computed(() => marketStore.error || currenciesStore.error);
  const lastUpdate = computed(
    () => marketStore.lastUpdate || currenciesStore.lastUpdate
  );
  const searchQuery = computed({
    get: () => marketStore.searchQuery,
    set: (value) => (marketStore.searchQuery = value),
  });
  const selectedType = computed({
    get: () => marketStore.selectedType,
    set: (value) => (marketStore.selectedType = value),
  });
  const sortBy = computed({
    get: () => marketStore.sortBy,
    set: (value) => (marketStore.sortBy = value),
  });
  const sortOrder = computed({
    get: () => marketStore.sortOrder,
    set: (value) => (marketStore.sortOrder = value),
  });
  const selectedCurrency = computed({
    get: () => currenciesStore.selectedCurrency,
    set: (value) => (currenciesStore.selectedCurrency = value),
  });
  const filteredMarketData = computed(() => marketStore.filteredMarketData);
  const isPolling = computed(() => marketStore.isPolling);
  const pollingInterval = computed(() => 10000);
  const nextUpdateTime = computed(() => null);

  const fetchCurrencies = async () => {
    return await currenciesStore.fetchCurrencies();
  };

  const fetchMarketData = async (isPollingUpdate = false) => {
    return await marketStore.fetchMarketData(isPollingUpdate);
  };

  const getCurrencyInfo = (code) => {
    return currenciesStore.getCurrencyInfo(code);
  };

  const formatPrice = (price, decimals = 2) => {
    return marketStore.formatPrice(price, decimals);
  };

  const formatVolume = (volume) => {
    return marketStore.formatVolume(volume);
  };

  const getDecimalPlaces = (price) => {
    if (price > 1000) return 2;
    if (price > 1) return 4;
    if (price > 0.01) return 5;
    return 8;
  };

  const getSecondaryCurrencies = () => {
    return currenciesStore.secondaryCurrencies;
  };

  const changeCurrency = (currencyCode) => {
    return currenciesStore.changeCurrency(currencyCode);
  };

  const getCryptoData = (primary, secondary = null) => {
    return marketStore.getCryptoData(primary, secondary);
  };

  const startPolling = (intervalMs = 10000) => {
    marketStore.startRealTimePolling(intervalMs);
  };

  const stopPolling = () => {
    marketStore.stopRealTimePolling();
  };

  const startAutoRefresh = (intervalMs = 10000) => {
    startPolling(intervalMs);
  };

  const stopAutoRefresh = () => {
    stopPolling();
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
  };
});
