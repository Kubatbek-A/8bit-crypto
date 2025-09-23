import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { ref, type Ref } from "vue";
import { API_CONFIG, HTTP_STATUS } from "@/constants/api";
import type { ApiError as ApiErrorType } from "@/types";

class ApiError extends Error {
  public code: string;
  public status?: number;

  constructor(message: string, code: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    if (status !== undefined) {
      this.status = status;
    }
  }
}

export function useApi() {
  const isLoading: Ref<boolean> = ref(false);
  const error: Ref<ApiErrorType | null> = ref(null);

  const createAxiosInstance = () => {
    return axios.create({
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const makeRequest = async <T = unknown>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T> => {
    const axiosInstance = createAxiosInstance();
    let lastError: Error | ApiError | null = null;

    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        isLoading.value = true;
        error.value = null;

        const response: AxiosResponse<T> = await axiosInstance({
          url,
          method: "GET",
          ...options,
        });

        if (response.status === HTTP_STATUS.OK) {
          return response.data;
        }

        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          "HTTP_ERROR",
          response.status
        );
      } catch (err: unknown) {
        lastError = err as Error;

        if (
          (err as Error & { code?: string }).code === "ECONNABORTED" ||
          (err as Error & { response?: { status?: number } }).response
            ?.status === HTTP_STATUS.NOT_FOUND
        ) {
          break;
        }

        if (attempt < API_CONFIG.RETRY_ATTEMPTS) {
          await delay(API_CONFIG.RETRY_DELAY * attempt);
        }
      } finally {
        isLoading.value = false;
      }
    }

    const apiError =
      lastError instanceof ApiError
        ? lastError
        : new ApiError(
            (lastError as Error)?.message || "Network request failed",
            (lastError as Error & { code?: string })?.code || "NETWORK_ERROR",
            (
              lastError as Error & { response?: { status?: number } }
            )?.response?.status
          );

    const errorValue: ApiErrorType = {
      message: apiError.message,
      code: apiError.code,
      timestamp: new Date(),
    };

    if (apiError.status !== undefined) {
      errorValue.status = apiError.status;
    }

    error.value = errorValue;

    throw apiError;
  };

  const fetchData = async <T = unknown>(
    url: string,
    options: AxiosRequestConfig = {}
  ): Promise<T | null> => {
    try {
      return await makeRequest<T>(url, options);
    } catch (err) {
      console.error(`API request failed for ${url}:`, err);
      return null;
    }
  };

  const clearError = (): void => {
    error.value = null;
  };

  return {
    isLoading,
    error,
    makeRequest,
    fetchData,
    clearError,
  };
}
