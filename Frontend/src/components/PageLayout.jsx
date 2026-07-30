import { useEffect } from "react";
import { usePageMeta } from "./AppShell";

/**
 * Sets navbar title/subtitle. Shell (sidebar/background/navbar) stays mounted via AppShell.
 */
function PageLayout({ title, subtitle, children }) {
  const setMeta = usePageMeta();

  useEffect(() => {
    if (!setMeta) return undefined;
    setMeta({
      title: title || "",
      subtitle: subtitle || "",
    });
  }, [setMeta, title, subtitle]);

  return <>{children}</>;
}

export default PageLayout;
