import axios from "axios";

export const api = axios.create({});

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
