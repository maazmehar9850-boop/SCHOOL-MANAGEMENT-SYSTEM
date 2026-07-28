import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

function AppToaster() {
  const [position, setPosition] = useState("top-center");

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)");
    const updatePosition = () => {
      setPosition(media.matches ? "top-right" : "top-center");
    };

    updatePosition();
    media.addEventListener("change", updatePosition);
    return () => media.removeEventListener("change", updatePosition);
  }, []);

  return (
    <Toaster
      position={position}
      reverseOrder={false}
      gutter={10}
      containerClassName="app-toaster"
      containerStyle={{ zIndex: 99999 }}
      toastOptions={{
        duration: 3500,
        className: "app-toast",
        style: {
          borderRadius: "14px",
          padding: "12px 16px",
          background: "rgba(15, 23, 42, 0.94)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(12px)",
          fontSize: "14px",
          fontFamily: "DM Sans, sans-serif",
          maxWidth: "min(92vw, 420px)",
          boxShadow: "0 16px 40px rgba(15, 23, 42, 0.24)",
        },
        success: {
          duration: 3200,
          style: {
            background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
            color: "#065f46",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            boxShadow: "0 14px 32px rgba(16, 185, 129, 0.18)",
          },
          iconTheme: {
            primary: "#10b981",
            secondary: "#ecfdf5",
          },
        },
        error: {
          duration: 4200,
          style: {
            background: "linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)",
            color: "#9f1239",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            boxShadow: "0 14px 32px rgba(244, 63, 94, 0.16)",
          },
          iconTheme: {
            primary: "#e11d48",
            secondary: "#fff1f2",
          },
        },
      }}
    />
  );
}

export default AppToaster;
