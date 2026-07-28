import axios from "axios";
import { isSessionExpiredByInactivity, markSessionActivity } from "./utils/session";
import { redirectToLogin } from "./utils/notify";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3030/api/v1",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && isSessionExpiredByInactivity()) {
    localStorage.clear();
    redirectToLogin("Session expired after 10 minutes of inactivity.");
    return Promise.reject(new axios.Cancel("Session expired due to inactivity"));
  }
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    markSessionActivity();
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const publicPaths = ["/", "/login", "/register", "/forgot-password", "/reset-password"];
      const message = error.response?.data?.message || "Session expired. Please log in again.";
      const onPublicPage = publicPaths.includes(window.location.pathname);
      const isLogoutRequest = error.config?.url?.includes("/logout");

      if (!isLogoutRequest && !onPublicPage) {
        localStorage.clear();
        redirectToLogin(message);
      }
    }
    return Promise.reject(error);
  }
);

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:3030/api/v1").replace(
  /\/api\/v1\/?$/,
  ""
);

export const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
};

export default API;
