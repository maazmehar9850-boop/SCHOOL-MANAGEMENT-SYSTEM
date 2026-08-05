import axios from "axios";
import { isSessionExpiredByInactivity, markSessionActivity } from "./utils/session";
import { redirectToLogin } from "./utils/notify";

function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || "").trim();
  const isStale =
    !fromEnv ||
    fromEnv.includes("sms-backendm.vercel.app") ||
    fromEnv.includes("sms-maaz.vercel.app");

  if (!isStale) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.PROD) return "https://cms-backen.vercel.app/api/v1";
  return fromEnv || "http://localhost:3030/api/v1";
}

const API_BASE = resolveApiBase();

const API = axios.create({
  baseURL: API_BASE,
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
      const publicPaths = [
        "/",
        "/about",
        "/academics",
        "/portal",
        "/gallery",
        "/contact",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ];
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

const API_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");


export const fileUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${API_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
};

export default API;
