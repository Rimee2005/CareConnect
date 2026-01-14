import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:bg-background-dark-secondary dark:text-text-dark dark:placeholder:text-text-dark-muted dark:ring-offset-background-dark dark:focus-visible:ring-primary-dark-mode transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

