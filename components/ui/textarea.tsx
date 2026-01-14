import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text ring-offset-background placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border-dark dark:bg-background-dark-secondary dark:text-text-dark dark:placeholder:text-text-dark-muted dark:ring-offset-background-dark dark:focus-visible:ring-primary-dark-mode transition-colors",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }

