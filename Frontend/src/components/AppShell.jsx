import { createContext, useContext, useMemo, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import Background from "./Background";
import AnimatedSidebar from "./AnimatedSidebar";
import ModernNavbar from "./ModernNavbar";
import { isSessionExpiredByInactivity } from "../utils/session";

const PageMetaContext = createContext(null);

export function usePageMeta() {
  return useContext(PageMetaContext);
}

function AppShell() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [meta, setMeta] = useState({ title: "", subtitle: "" });

  const variant = useMemo(() => {
    if (role === "admin") return "admin";
    if (role === "teacher") return "teacher";
    if (role === "student") return "student";
    return "default";
  }, [role]);

  if (!token || !role || isSessionExpiredByInactivity()) {
    if (token && isSessionExpiredByInactivity()) localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return (
    <PageMetaContext.Provider value={setMeta}>
      <Background variant={variant}>
        <div className="flex min-h-screen">
          <AnimatedSidebar role={role} />
          <div className="flex min-w-0 flex-1 flex-col">
            <ModernNavbar role={role} title={meta.title} subtitle={meta.subtitle} />
            <main className="flex-1 px-3 pb-6 pt-4 md:px-5 md:pb-8">
              <div className="mx-auto max-w-7xl space-y-5">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </Background>
    </PageMetaContext.Provider>
  );
}

export default AppShell;
