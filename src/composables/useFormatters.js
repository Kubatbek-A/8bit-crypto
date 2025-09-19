export function useFormatters() {
  const formatPrice = (price, decimals = 2) => {
    if (price === null || price === undefined || price === "") return "0.00";

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "0.00";

    return numPrice.toLocaleString("en-AU", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const formatVolume = (volume) => {
    if (volume === null || volume === undefined || volume === "") return "0";

    const num = parseFloat(volume);
    if (isNaN(num)) return "0";

    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toFixed(2);
  };

  const getDecimalPlaces = (price) => {
    if (price > 1000) return 2;
    if (price > 1) return 4;
    if (price > 0.01) return 5;
    return 8;
  };

  const formatPercentage = (percent, direction) => {
    const sign = direction === "Up" ? "+" : "-";
    return `${sign}${percent}%`;
  };

  const getConsistentTimezone = () => {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  };

  const formatTime = (timestamp, includeDate = false) => {
    const date = new Date(timestamp * 1000);
    const timezone = getConsistentTimezone();

    if (includeDate) {
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone,
      });
    }

    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    });
  };

  const formatChartTime = (timestamp) => {
    return formatTime(timestamp, false);
  };

  const formatCurrencyPair = (primary, secondary) => {
    return `${primary.toUpperCase()}/${secondary.toUpperCase()}`;
  };

  return {
    formatPrice,
    formatVolume,
    getDecimalPlaces,
    formatPercentage,
    formatTime,
    formatChartTime,
    formatCurrencyPair,
    getConsistentTimezone,
  };
}
