import { useEffect } from "react";

const BRAND = "Aspira College";

/** Sets the browser tab title as "Page | Aspira College". */
export function useDocumentTitle(pageTitle) {
  useEffect(() => {
    const previous = document.title;
    document.title = pageTitle ? `${pageTitle} | ${BRAND}` : BRAND;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}

export default useDocumentTitle;
