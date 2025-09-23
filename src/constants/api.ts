import type { ApiConfig, PollingConfig, HttpStatus } from '@/types';

export const API_ENDPOINTS = {
  CURRENCY:
    "https://requestly.tech/api/mockv2/test/api/currency?username=user26614",
  MARKET:
    "https://requestly.tech/api/mockv2/test/api/market?username=user26614",
} as const;

export const API_CONFIG: ApiConfig = {
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const POLLING_CONFIG: PollingConfig = {
  INTERVAL: 10000, // 10 seconds
  COUNTDOWN_INTERVAL: 1000, // 1 second
};

export const HTTP_STATUS: HttpStatus = {
  OK: 200,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  TIMEOUT: 408,
};
