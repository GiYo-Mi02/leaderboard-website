import axios from "axios";

// Prefer explicitly configured API base, then same-origin /api for local dev via Vite proxy
const baseURL = (import.meta?.env?.VITE_API_BASE) || "/api";

export const api = axios.create({ baseURL });

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const msg =
      error?.response?.data?.error || error?.message || "Request failed";
    if (
      typeof window !== "undefined" &&
      typeof window.__notify === "function"
    ) {
      window.__notify(
        msg,
        "error",
        error?.response?.data || error?.toJSON?.() || String(error)
      );
    }
    return Promise.reject(error);
  }
);

export default api;
