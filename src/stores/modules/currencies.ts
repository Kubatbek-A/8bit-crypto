import { ref, computed, type Ref, type ComputedRef } from "vue";
import { defineStore } from "pinia";
import { CURRENCIES_DATA } from "@/constants/currencies";
import { API_ENDPOINTS } from "@/constants/api";
import { useApi } from "@/composables/useApi";
import { useLocalStorage } from "@/composables/useLocalStorage";
import type {
  CurrencyInfo,
  ApiError,
  MarketDataItem,
  Optional,
  Nullable,
} from "@/types";

export const useCurrenciesStore = defineStore("currencies", () => {
  const { fetchData } = useApi();
  const { value: selectedCurrency } = useLocalStorage<string>(
    "selectedCurrency",
    "Aud"
  );

  const currencies: Ref<CurrencyInfo[]> = ref(CURRENCIES_DATA);
  const isLoading: Ref<boolean> = ref(false);
  const error: Ref<Nullable<ApiError>> = ref(null);
  const lastUpdate: Ref<Nullable<Date>> = ref(null);

  const primaryCurrencies: ComputedRef<CurrencyInfo[]> = computed(() =>
    currencies.value.filter((currency) => currency.type === "Primary")
  );

  const secondaryCurrencies: ComputedRef<CurrencyInfo[]> = computed(() => {
    const seen = new Set<string>();
    return currencies.value
      .filter((currency) => {
        if (currency.type === "Secondary" && !seen.has(currency.code)) {
          seen.add(currency.code);
          return true;
        }
        return false;
      })
      .sort((a, b) => a.sort_order - b.sort_order);
  });

  const selectedCurrencyInfo: ComputedRef<Optional<CurrencyInfo>> = computed(
    () =>
      currencies.value.find(
        (currency) => currency.code === selectedCurrency.value
      )
  );

  const fetchCurrencies = async (): Promise<boolean> => {
    try {
      isLoading.value = true;
      error.value = null;

      const apiCurrencies = await fetchData<CurrencyInfo[]>(
        API_ENDPOINTS.CURRENCY
      );

      if (apiCurrencies) {
        const apiCurrencyCodes = new Set(
          apiCurrencies.map((curr) => curr.code)
        );
        const uniqueSecondaryCurrencies = CURRENCIES_DATA.filter(
          (curr) =>
            curr.type === "Secondary" && !apiCurrencyCodes.has(curr.code)
        );

        const combinedCurrencies = [
          ...apiCurrencies,
          ...uniqueSecondaryCurrencies,
        ];

        currencies.value = combinedCurrencies;
        lastUpdate.value = new Date();

        console.log(
          "Currencies updated:",
          combinedCurrencies.length,
          "currencies loaded"
        );
        return true;
      } else {
        console.warn("Using fallback currency data");
        currencies.value = CURRENCIES_DATA;
        return false;
      }
    } catch (err) {
      console.error("Failed to fetch currencies:", err);
      error.value = {
        message: "Failed to load currencies",
        code: "CURRENCIES_FETCH_ERROR",
        timestamp: new Date(),
      };

      currencies.value = CURRENCIES_DATA;
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const getCurrencyInfo = (code: string): Optional<CurrencyInfo> => {
    return currencies.value.find(
      (currency) => currency.code.toLowerCase() === code.toLowerCase()
    );
  };

  const changeCurrency = (currencyCode: string): boolean => {
    const currency = getCurrencyInfo(currencyCode);
    if (!currency || currency.type !== "Secondary") {
      console.warn(`Invalid secondary currency code: ${currencyCode}`);
      return false;
    }

    selectedCurrency.value = currencyCode;
    console.log(`Currency changed to: ${currencyCode}`);
    return true;
  };

  const getAvailableSecondaryCurrencies = (
    marketData: MarketDataItem[] = []
  ): CurrencyInfo[] => {
    const currenciesWithPairs = new Set(
      marketData.map((item) => item.pair.secondary)
    );
    return secondaryCurrencies.value.filter((currency) =>
      currenciesWithPairs.has(currency.code)
    );
  };

  const getAvailableCurrenciesForCrypto = (
    primaryCode: string,
    marketData: MarketDataItem[] = []
  ): CurrencyInfo[] => {
    const availableCodes = new Set(
      marketData
        .filter(
          (item) =>
            item.pair.primary.toLowerCase() === primaryCode.toLowerCase()
        )
        .map((item) => item.pair.secondary)
    );

    return secondaryCurrencies.value.filter((currency) =>
      availableCodes.has(currency.code)
    );
  };

  const clearError = (): void => {
    error.value = null;
  };

  const reset = (): void => {
    currencies.value = CURRENCIES_DATA;
    isLoading.value = false;
    error.value = null;
    lastUpdate.value = null;
    selectedCurrency.value = "Aud";
  };

  return {
    currencies,
    isLoading,
    error,
    lastUpdate,
    selectedCurrency,

    primaryCurrencies,
    secondaryCurrencies,
    selectedCurrencyInfo,

    fetchCurrencies,
    getCurrencyInfo,
    changeCurrency,
    getAvailableSecondaryCurrencies,
    getAvailableCurrenciesForCrypto,
    clearError,
    reset,
  };
});
