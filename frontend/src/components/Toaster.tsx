"use client";

import { Toaster as HotToaster } from "react-hot-toast";

export function Toaster() {
  return (
    <HotToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "oklch(0.16 0.01 60)",
          color: "oklch(0.95 0.005 60)",
          border: "1px solid oklch(0.22 0.005 60)",
          borderRadius: "0.5rem",
        },
        success: {
          style: {
            background: "oklch(0.16 0.01 60)",
            color: "oklch(0.6 0.14 150)",
            border: "1px solid oklch(0.22 0.005 60)",
          },
        },
        error: {
          style: {
            background: "oklch(0.16 0.01 60)",
            color: "oklch(0.55 0.18 10)",
            border: "1px solid oklch(0.22 0.005 60)",
          },
        },
      }}
    />
  );
}