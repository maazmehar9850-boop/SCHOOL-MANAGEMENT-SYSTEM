import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { logout } from "../utils/auth";
import {
  INACTIVITY_LIMIT_MS,
  INACTIVITY_WARNING_MS,
  getLastActivityAt,
  isSessionExpiredByInactivity,
  markSessionActivity,
} from "../utils/session";

const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];

function SessionManager() {
  const navigate = useNavigate();

  useEffect(() => {
    let warningTimeoutId;
    let logoutTimeoutId;
    let warningShown = false;

    const clearTimers = () => {
      window.clearTimeout(warningTimeoutId);
      window.clearTimeout(logoutTimeoutId);
    };

    const showWarningIfNeeded = () => {
      if (!localStorage.getItem("token") || warningShown) return;
      warningShown = true;
      toast("Session will expire in 1 minute due to inactivity.", {
        icon: "⏳",
        duration: 5000,
      });
    };

    const scheduleTimers = () => {
      clearTimers();
      if (!localStorage.getItem("token")) return;

      const lastActivityAt = getLastActivityAt() || Date.now();
      const elapsed = Date.now() - lastActivityAt;
      const msUntilLogout = INACTIVITY_LIMIT_MS - elapsed;
      const msUntilWarning = msUntilLogout - INACTIVITY_WARNING_MS;

      if (msUntilLogout <= 0) {
        handleExpiredSession();
        return;
      }

      warningShown = false;

      if (msUntilWarning > 0) {
        warningTimeoutId = window.setTimeout(showWarningIfNeeded, msUntilWarning);
      } else {
        showWarningIfNeeded();
      }

      logoutTimeoutId = window.setTimeout(handleExpiredSession, msUntilLogout);
    };

    const handleActivity = () => {
      markSessionActivity();
      warningShown = false;
      scheduleTimers();
    };

    const handleExpiredSession = async () => {
      if (!isSessionExpiredByInactivity()) return;
      await logout(navigate, { silent: true, reason: "inactive" });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (isSessionExpiredByInactivity()) {
          handleExpiredSession();
        } else {
          scheduleTimers();
        }
      }
    };

    EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    scheduleTimers();

    return () => {
      clearTimers();
      EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  return null;
}

export default SessionManager;
