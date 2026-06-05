"use client";

import { useCallback } from "react";
import toast from "react-hot-toast";

interface ToastOptions {
  icon?: string;
  duration?: number;
}

export function useToast() {
  return useCallback(
    (message: string, options?: ToastOptions) => {
      toast(message, {
        icon: options?.icon,
        duration: options?.duration || 3000,
        style: {
          background: "#1f2937",
          color: "#f9fafb",
          border: "1px solid #374151",
        },
      });
    },
    []
  );
}