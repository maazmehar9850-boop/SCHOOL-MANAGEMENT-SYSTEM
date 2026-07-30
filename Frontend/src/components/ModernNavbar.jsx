import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Bell, Sparkles } from "lucide-react";
import API from "../api";
import GradientButton from "./GradientButton";
import { logout as signOut } from "../utils/auth";
import {
  clearNotifications,
  clearRemoteNotificationCache,
  fetchRemoteNotifications,
  getCachedRemoteNotifications,
  getSeenNotificationIds,
  getNotifications,
  markNotificationIdsSeen,
  subscribeToNotifications,
} from "../utils/notificationCenter";

function ModernNavbar({ role, title, subtitle }) {
  const navigate = useNavigate();
  const name = localStorage.getItem("name") || "User";
  const [isOpen, setIsOpen] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(() => getNotifications());
  const [remoteNotifications, setRemoteNotifications] = useState(() => getCachedRemoteNotifications());
  const [seenIds, setSeenIds] = useState(() => getSeenNotificationIds());
  const [loadingRemote, setLoadingRemote] = useState(false);
  const panelRef = useRef(null);

  const defaults = {
    admin: {
      title: "Admin Dashboard",
      subtitle: "Manage students, teachers, and courses",
    },
    teacher: {
      title: "Teacher Dashboard",
      subtitle: "Attendance, marks, and your classes",
    },
    student: {
      title: "Student Dashboard",
      subtitle: "Track attendance, results, and subjects",
    },
  };

  const meta = defaults[role] || {};
  const notifications = useMemo(() => {
    const merged = [...remoteNotifications, ...localNotifications];
    const unique = merged.filter(
      (item, index) => merged.findIndex((entry) => entry.id === item.id) === index
    );

    return unique
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);
  }, [localNotifications, remoteNotifications]);
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read && !seenIds.includes(item.id)).length,
    [notifications, seenIds]
  );

  const logout = () => signOut(navigate);

  useEffect(() => subscribeToNotifications(setLocalNotifications), []);

  const loadRemoteNotifications = useCallback(async ({ showLoading = false, force = false } = {}) => {
    if (!localStorage.getItem("token")) return [];
    if (document.visibilityState === "hidden") return getCachedRemoteNotifications();

    if (showLoading) setLoadingRemote(true);
    try {
      const items = await fetchRemoteNotifications(async () => {
        const res = await API.get("/notifications");
        return Array.isArray(res.data?.notifications) ? res.data.notifications : [];
      }, { force });
      setRemoteNotifications(items);
      return items;
    } catch {
      setRemoteNotifications(getCachedRemoteNotifications());
      return getCachedRemoteNotifications();
    } finally {
      if (showLoading) setLoadingRemote(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) return undefined;

    loadRemoteNotifications();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadRemoteNotifications({ force: true });
      }
    }, 90000);

    return () => window.clearInterval(intervalId);
  }, [loadRemoteNotifications]);

  useEffect(() => {
    if (!isOpen || notifications.length === 0) return;
    const unreadIds = notifications
      .filter((item) => !item.read && !seenIds.includes(item.id))
      .map((item) => item.id);
    if (unreadIds.length === 0) return;
    setSeenIds(markNotificationIdsSeen(unreadIds));
  }, [isOpen, notifications, seenIds]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleNotifications = async () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      await loadRemoteNotifications({
        showLoading: remoteNotifications.length === 0,
        force: true,
      });
    }
  };

  const handleClearNotifications = () => {
    setSeenIds(markNotificationIdsSeen(notifications.map((item) => item.id)));
    setLocalNotifications([]);
    setRemoteNotifications([]);
    clearNotifications();
    clearRemoteNotificationCache();
  };

  const formatTime = (value) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Just now";

    return new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(date);
  };

  const toneClasses = {
    success: "border-emerald-200/70 bg-emerald-50 text-emerald-700",
    error: "border-rose-200/80 bg-rose-50 text-rose-700",
    info: "border-sky-200/80 bg-sky-50 text-sky-700",
  };

  return (
    <header className="app-navbar glass-nav sticky top-0 z-20 mx-3 mt-3 rounded-[1.35rem] px-5 py-4 md:mx-5 md:mt-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 pl-10 md:pl-0">
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-sky-300/12 bg-sky-400/8 px-2.5 py-1">
            <Sparkles size={12} className="text-sky-300" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-sky-300">
              {name}
            </p>
          </div>
          <h1 className="font-display mt-0.5 truncate text-xl font-bold text-slate-900 md:text-2xl">
            {title || meta.title}
          </h1>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {subtitle || meta.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-end md:self-auto">
          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              className="relative inline-flex rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Notifications"
              aria-expanded={isOpen}
            >
              <Bell size={17} />
              {unreadCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white shadow-[0_8px_18px_rgba(244,63,94,0.35)]">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </button>

            {isOpen ? (
              <>
                <button
                  type="button"
                  className="notification-backdrop fixed inset-0 z-[90] bg-slate-950/45 sm:hidden"
                  aria-label="Close notifications"
                  onClick={() => setIsOpen(false)}
                />
                <div className="notification-panel fixed left-3 right-3 top-[5.25rem] z-[100] flex max-h-[min(72vh,26rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.22)] sm:absolute sm:left-auto sm:right-0 sm:top-[calc(100%+12px)] sm:w-[min(calc(100vw-2rem),22rem)] sm:max-h-80">
                  <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">Notifications</p>
                      <p className="text-xs text-slate-500">
                        {notifications.length === 0
                          ? "No recent updates"
                          : `${notifications.length} recent update${notifications.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    {notifications.length > 0 ? (
                      <button
                        type="button"
                        onClick={handleClearNotifications}
                        className="shrink-0 text-xs font-medium text-slate-500 transition hover:text-slate-900"
                      >
                        Clear all
                      </button>
                    ) : null}
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3">
                    {loadingRemote && notifications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm leading-6 text-slate-500">
                        New notifications will appear here.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {notifications.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <span
                                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                  toneClasses[item.type] || toneClasses.info
                                }`}
                              >
                                {item.type}
                              </span>
                              <span className="shrink-0 text-[11px] leading-5 text-slate-400">
                                {formatTime(item.createdAt)}
                              </span>
                            </div>
                            {item.title ? (
                              <p className="mt-2 break-words text-sm font-semibold leading-5 text-slate-900">
                                {item.title}
                              </p>
                            ) : null}
                            <p
                              className={`break-words text-sm leading-6 text-slate-700 ${
                                item.title ? "mt-1" : "mt-2"
                              }`}
                            >
                              {item.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-sky-300/12 bg-gradient-to-br from-[#1d4ed8] via-[#2563eb] to-[#0891b2] text-xs font-bold text-white shadow-[0_16px_32px_rgba(37,99,235,0.28)] transition hover:scale-105 sm:flex"
            title="Open profile"
            aria-label="Open profile"
          >
            {name.charAt(0).toUpperCase()}
          </button>
          <GradientButton variant="secondary" onClick={logout} className="!py-2 !px-4">
            <LogOut size={15} />
            Logout
          </GradientButton>
        </div>
      </div>
    </header>
  );
}

export default ModernNavbar;
