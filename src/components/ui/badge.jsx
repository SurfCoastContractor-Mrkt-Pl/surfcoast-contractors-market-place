import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        // Default = amber/dark (matches SC brand)
        default:
          "border-amber-800/30 bg-amber-50 text-amber-900 hover:bg-amber-100",
        // Dark pill (used for status)
        dark:
          "border-transparent bg-[#1A1A1B] text-[#F0E0C0]",
        // Outline
        outline:
          "border-[#D0D0D2] bg-white text-[#1A1A1B]",
        // Success / verified
        success:
          "border-green-300/50 bg-green-50 text-green-800",
        // Warning / pending
        warning:
          "border-amber-300/50 bg-amber-50 text-amber-900",
        // Destructive / error
        destructive:
          "border-red-300/50 bg-red-50 text-red-800",
        // Secondary (neutral gray)
        secondary:
          "border-[#D0D0D2] bg-[#EBEBEC] text-[#333]",
        // Orange (strong highlight)
        orange:
          "border-orange-300 bg-orange-50 text-orange-900",
        // Legacy blue — still available if explicitly used
        blue:
          "border-blue-300/50 bg-blue-50 text-blue-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }