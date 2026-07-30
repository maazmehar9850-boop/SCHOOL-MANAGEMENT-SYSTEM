import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../utils/auth";
import { notifyInfo } from "../utils/notify";
import {
  INACTIVITY_LIMIT_MS,
  INACTIVITY_WARNING_MS,
  getLastActivityAt,
  isSessionExpiredByInactivity,
  markSessionActivity,
} from "../utils/session";

const EVENTS = ["mousedown", "keydown", "touchstart", "click", "scroll"];
const ACTIVITY_THROTTLE_MS = 4000;

function SessionManager() {
  const navigate = useNavigate();

  useEffect(() => {
    let warningTimeoutId;
    let logoutTimeoutId;
    let warningShown = false;
    let lastHandledAt = 0;
    let pendingActivity = false;
    let activityFlushId;

    const clearTimers = () => {
      window.clearTimeout(warningTimeoutId);
      window.clearTimeout(logoutTimeoutId);
    };

    const showWarningIfNeeded = () => {
      if (!localStorage.getItem("token") || warningShown) return;
      warningShown = true;
      notifyInfo("Session will expire in 1 minute due to inactivity.");
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

    const flushActivity = () => {
      pendingActivity = false;
      activityFlushId = undefined;
      lastHandledAt = Date.now();
      markSessionActivity();
      warningShown = false;
      scheduleTimers();
    };

    const handleActivity = () => {
      if (!localStorage.getItem("token")) return;

      const now = Date.now();
      if (now - lastHandledAt >= ACTIVITY_THROTTLE_MS) {
        flushActivity();
        return;
      }

      if (pendingActivity) return;
      pendingActivity = true;
      activityFlushId = window.setTimeout(flushActivity, ACTIVITY_THROTTLE_MS - (now - lastHandledAt));
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
      window.clearTimeout(activityFlushId);
      EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [navigate]);

  return null;
}

export default SessionManager;
