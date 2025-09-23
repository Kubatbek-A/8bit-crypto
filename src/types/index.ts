import type { IChartApi, ISeriesApi } from "lightweight-charts";

// API Types
export interface ApiError {
  message: string;
  code: string;
  status?: number;
  timestamp: Date;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

// Currency Types
export interface CurrencyInfo {
  code: string;
  sort_order: number;
  ticker: string;
  type: string;
  decimals_places: number;
  icon: string;
}

export interface CurrencyPair {
  primary: string;
  secondary: string;
}

// Market Data Types
export interface PriceChange {
  direction: "Up" | "Down";
  percent: string;
  amount?: string;
}

export interface Price {
  last: string;
  change: PriceChange;
}

export interface Volume {
  primary: string;
  secondary: string;
}

export interface MarketDataItem {
  pair: CurrencyPair;
  price: Price;
  volume: Volume;
  priceHistory?: number[];
}

export interface MarketStats {
  totalPairs: number;
  totalVolume: string;
  avgChange: string;
  topGainer: MarketDataItem | null;
  topLoser: MarketDataItem | null;
}

// Chart Types
export interface ChartData {
  time: number;
  value: number;
}

// Chart Dataset Types
export interface ChartDatasetData {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  borderWidth?: number;
  fill: boolean;
  tension: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointHoverBackgroundColor?: string;
  pointHoverBorderColor?: string;
  pointHoverBorderWidth?: number;
}

export interface ChartDataConfig {
  labels: string[];
  datasets: ChartDatasetData[];
}

export interface ChartConfig {
  labels: string[];
  datasets: ChartDatasetData[];
}

export interface ChartOptions {
  responsive: boolean;
  maintainAspectRatio: boolean;
  scales: {
    x: { display: boolean };
    y: { display: boolean };
  };
  plugins: {
    legend: { display: boolean };
    tooltip: { enabled: boolean };
  };
  elements: {
    point: { radius: number };
  };
  layout: {
    padding: {
      top: number;
      bottom: number;
    };
  };
}

export interface CrosshairParam {
  point?: { x: number; y: number };
  time?: number;
  seriesData: Map<ISeriesApi<"Area">, unknown>;
}

export interface ChartWithResizeObserver extends IChartApi {
  _resizeObserver?: ResizeObserver;
}

export interface ChartConfig {
  width: number;
  height: number;
  layout: {
    backgroundColor: string;
    textColor: string;
  };
  grid: {
    vertLines: { color: string };
    horzLines: { color: string };
  };
  crosshair: {
    mode: number;
  };
  rightPriceScale: {
    borderColor: string;
  };
  timeScale: {
    borderColor: string;
  };
}

// Store Types
export interface MarketStoreState {
  marketData: MarketDataItem[];
  isLoading: boolean;
  isInitialLoad: boolean;
  error: ApiError | null;
  lastUpdate: Date | null;
  searchQuery: string;
  selectedType: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface CurrenciesStoreState {
  currencies: CurrencyInfo[];
  selectedCurrency: string;
  isLoading: boolean;
  error: ApiError | null;
}

// Component Props Types
export interface ErrorBoundaryProps {
  boundaryId: string;
  retryable?: boolean;
}

export interface CurrencySwitcherProps {
  // Add props if needed
}

export interface PriceChartProps {
  data: ChartData[];
  height?: number;
}

export interface DetailSkeletonProps {
  // Add props if needed
}

export interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

// Router Types
export interface RouteParams {
  id?: string;
}

// Utility Types
export type SortField = "name" | "price" | "change" | "volume";
export type SortOrder = "asc" | "desc";
export type CurrencyType = "crypto" | "fiat" | "all";

// Type utilities for better type safety
export type Optional<T> = T | undefined;
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type NonEmptyString = string & { readonly __brand: unique symbol };

// API Configuration Types
export interface ApiConfig {
  TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  RETRY_DELAY: number;
}

export interface PollingConfig {
  INTERVAL: number;
  COUNTDOWN_INTERVAL: number;
}

export interface HttpStatus {
  OK: number;
  NOT_FOUND: number;
  SERVER_ERROR: number;
  TIMEOUT: number;
}
