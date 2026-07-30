import toast from "react-hot-toast";
import API from "../api";
import { clearSessionActivity, startSession } from "./session";
import { resetAuthRedirectState } from "./notify";
import { clearRemoteNotificationCache } from "./notificationCenter";
import { clearCache } from "./apiCache";

export async function logout(navigate, options = {}) {
  const { silent = false, reason = "manual" } = options;
  try {
    await API.post("/logout");
  } catch {
    // Clear local session even if the server call fails.
  }

  localStorage.clear();
  clearSessionActivity();
  clearRemoteNotificationCache();
  clearCache();
  resetAuthRedirectState();

  if (!silent) {
    toast.success("Logged out successfully");
  } else if (reason === "inactive") {
    toast.error("Session expired after 10 minutes of inactivity.");
  }

  const delay = silent ? 1400 : 700;
  window.setTimeout(() => {
    if (typeof navigate === "function") {
      navigate("/login", { replace: true });
    } else {
      window.location.href = "/login";
    }
  }, delay);
}

export function beginAuthenticatedSession() {
  startSession();
}
