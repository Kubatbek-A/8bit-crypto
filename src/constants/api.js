export const API_ENDPOINTS = {
  CURRENCY:
    "https://requestly.tech/api/mockv2/test/api/currency?username=user26614",
  MARKET:
    "https://requestly.tech/api/mockv2/test/api/market?username=user26614",
};

export const API_CONFIG = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const POLLING_CONFIG = {
  INTERVAL: 10000, // 10 seconds
  COUNTDOWN_INTERVAL: 1000, // 1 second
};

export const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  TIMEOUT: 408,
};
