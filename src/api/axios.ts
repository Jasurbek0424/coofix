import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://coofix.store/api";

// Extended Error type for unauthorized errors
interface UnauthorizedError extends Error {
  isUnauthorized: boolean;
  status: number;
}

export const api = axios.create({
  baseURL,
  withCredentials: false, // CORS muammosi tufayli false qildik
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Authentication kerak bo'lgan so'rovlar uchun alohida instance
export const apiAuth = axios.create({
  baseURL,
  withCredentials: true, // Auth so'rovlari uchun credentials kerak
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor - token qo'shish
apiAuth.interceptors.request.use(
  (config) => {
    // Token localStorage'dan olish
    if (typeof window !== "undefined") {
      const userStorage = localStorage.getItem("user-storage");
      if (userStorage) {
        try {
          const parsed = JSON.parse(userStorage);
          const token = parsed?.state?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error("Failed to parse user storage:", error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - error handling
apiAuth.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Network error handling
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return Promise.reject(
        new Error("Сервер недоступен. Проверьте подключение к интернету.")
      );
    }

    // CORS error handling
    if (error.code === "ERR_CORS") {
      return Promise.reject(
        new Error("Ошибка CORS. Обратитесь к администратору.")
      );
    }

    // Timeout error
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Время ожидания истекло. Попробуйте еще раз.")
      );
    }

    // Server error responses
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data;
      // Try to extract error message from various possible fields
      const message = 
        responseData?.message || 
        responseData?.error || 
        (typeof responseData === 'string' ? responseData : null);

      if (status === 401) {
        // Unauthorized - clear user data
        if (typeof window !== "undefined") {
          localStorage.removeItem("user-storage");
          // Trigger storage event to notify Zustand store
          window.dispatchEvent(new Event("storage"));
        }
        // Backend'dan kelgan message'ni ko'rsatish, yoki default message
        const errorMsg = message || "Неверный email или пароль.";
        const error = new Error(errorMsg) as UnauthorizedError;
        // Add a flag to identify 401 errors
        error.isUnauthorized = true;
        error.status = 401;
        return Promise.reject(error);
      }

      if (status === 403) {
        return Promise.reject(new Error(message || "Доступ запрещен."));
      }

      if (status === 404) {
        return Promise.reject(new Error(message || "Ресурс не найден."));
      }

      if (status === 400 || status === 409) {
        // Bad request or conflict (e.g., email exists, validation error)
        return Promise.reject(
          new Error(message || "Ошибка при обработке запроса.")
        );
      }

      if (status >= 500) {
        return Promise.reject(
          new Error(message || "Ошибка сервера. Попробуйте позже.")
        );
      }

      return Promise.reject(
        new Error(message || `Ошибка ${status}: ${error.response.statusText}`)
      );
    }

    return Promise.reject(error);
  }
);

// api instance uchun ham interceptor qo'shamiz
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      return Promise.reject(
        new Error("Сервер недоступен. Проверьте подключение к интернету.")
      );
    }
    return Promise.reject(error);
  }
);
