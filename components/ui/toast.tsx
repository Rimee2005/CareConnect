'use client';

import * as React from "react"
import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose?: () => void
  duration?: number // Auto-dismiss duration in milliseconds
}

export function Toast({ message, type = "info", onClose, duration = 4000 }: ToastProps) {
  const bgColor = {
    success: "bg-success",
    error: "bg-error",
    info: "bg-primary",
  }[type]

  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-lg px-6 py-4 text-white shadow-medium animate-in slide-in-from-bottom-5",
        bgColor
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="pr-2">{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:opacity-80 transition-opacity flex-shrink-0"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

