import { useEffect } from "react";
import { usePageMeta } from "./AppShell";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

/**
 * Sets navbar title/subtitle. Shell (sidebar/background/navbar) stays mounted via AppShell.
 */
function PageLayout({ title, subtitle, children }) {
  const setMeta = usePageMeta();
  useDocumentTitle(title);

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
