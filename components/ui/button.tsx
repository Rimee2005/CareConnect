import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-dark dark:bg-primary-dark-mode dark:hover:bg-primary-dark-mode-hover",
        secondary: "bg-secondary text-white hover:bg-secondary-dark dark:bg-secondary-dark-mode dark:hover:bg-secondary-dark-mode-hover",
        outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary-dark-mode dark:text-primary-dark-mode dark:hover:bg-primary-dark-mode dark:hover:text-white",
        ghost: "hover:bg-background-secondary text-text dark:hover:bg-background-dark-secondary dark:text-text-dark",
        destructive: "bg-error text-white hover:bg-error/90",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

