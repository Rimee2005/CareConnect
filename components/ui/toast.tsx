import * as React from "react"
import { cn } from "@/lib/utils"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "info"
  onClose?: () => void
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const bgColor = {
    success: "bg-success",
    error: "bg-error",
    info: "bg-primary",
  }[type]

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 rounded-lg px-6 py-4 text-white shadow-medium",
        bgColor
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-4">
        <p>{message}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:opacity-80"
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

