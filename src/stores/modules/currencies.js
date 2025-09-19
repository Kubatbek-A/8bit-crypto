import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { CURRENCIES_DATA } from "../../constants/currencies.js";
import { API_ENDPOINTS } from "../../constants/api.js";
import { useApi } from "../../composables/useApi.js";
import { useLocalStorage } from "../../composables/useLocalStorage.js";

export const useCurrenciesStore = defineStore("currencies", () => {
  const { fetchData } = useApi();
  const { value: selectedCurrency } = useLocalStorage(
    "selectedCurrency",
    "Aud"
  );

  const currencies = ref(CURRENCIES_DATA);
  const isLoading = ref(false);
  const error = ref(null);
  const lastUpdate = ref(null);

  const primaryCurrencies = computed(() =>
    currencies.value.filter((currency) => currency.type === "Primary")
  );

  const secondaryCurrencies = computed(() => {
    const seen = new Set();
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

  const selectedCurrencyInfo = computed(() =>
    currencies.value.find(
      (currency) => currency.code === selectedCurrency.value
    )
  );

  const fetchCurrencies = async () => {
    try {
      isLoading.value = true;
      error.value = null;

      const apiCurrencies = await fetchData(API_ENDPOINTS.CURRENCY);

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

  const getCurrencyInfo = (code) => {
    return currencies.value.find(
      (currency) => currency.code.toLowerCase() === code.toLowerCase()
    );
  };

  const changeCurrency = (currencyCode) => {
    const currency = getCurrencyInfo(currencyCode);
    if (!currency || currency.type !== "Secondary") {
      console.warn(`Invalid secondary currency code: ${currencyCode}`);
      return false;
    }

    selectedCurrency.value = currencyCode;
    console.log(`Currency changed to: ${currencyCode}`);
    return true;
  };

  const getAvailableSecondaryCurrencies = (marketData = []) => {
    const currenciesWithPairs = new Set(
      marketData.map((item) => item.pair.secondary)
    );
    return secondaryCurrencies.value.filter((currency) =>
      currenciesWithPairs.has(currency.code)
    );
  };

  const getAvailableCurrenciesForCrypto = (primaryCode, marketData = []) => {
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

  const clearError = () => {
    error.value = null;
  };

  const reset = () => {
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
