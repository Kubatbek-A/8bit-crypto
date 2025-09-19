import axios from "axios";
import { ref } from "vue";
import { API_CONFIG, HTTP_STATUS } from "../constants/api.js";

class ApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function useApi() {
  const isLoading = ref(false);
  const error = ref(null);

  const createAxiosInstance = () => {
    return axios.create({
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const makeRequest = async (url, options = {}) => {
    const axiosInstance = createAxiosInstance();
    let lastError;

    for (let attempt = 1; attempt <= API_CONFIG.RETRY_ATTEMPTS; attempt++) {
      try {
        isLoading.value = true;
        error.value = null;

        const response = await axiosInstance({
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
      } catch (err) {
        lastError = err;

        if (
          err.code === "ECONNABORTED" ||
          err.response?.status === HTTP_STATUS.NOT_FOUND
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
            lastError?.message || "Network request failed",
            lastError?.code || "NETWORK_ERROR",
            lastError?.response?.status
          );

    error.value = {
      message: apiError.message,
      code: apiError.code,
      status: apiError.status,
      timestamp: new Date(),
    };

    throw apiError;
  };

  const fetchData = async (url, options = {}) => {
    try {
      return await makeRequest(url, options);
    } catch (err) {
      console.error(`API request failed for ${url}:`, err);
      return null;
    }
  };

  const clearError = () => {
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
