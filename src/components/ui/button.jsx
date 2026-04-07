import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        // Primary = dark with amber shadow (SC brand)
        default:
          "bg-[#1A1A1B] text-[#F0E0C0] shadow-[3px_3px_0px_#5C3500] hover:shadow-[3px_3px_0px_#5C3500,0_0_14px_3px_rgba(255,180,0,0.3)]",
        // Amber filled
        amber:
          "bg-[#F0E0C0] text-[#5C3500] border border-[#D9B88A] hover:shadow-[0_0_14px_3px_rgba(255,180,0,0.3)]",
        // Outline (white card style)
        outline:
          "border border-[#D0D0D2] bg-white text-[#1A1A1B] hover:shadow-[0_0_14px_3px_rgba(255,180,0,0.3)] hover:border-[#D9B88A]",
        // Ghost
        ghost:
          "bg-transparent text-[#333] hover:bg-[#FBF5EC] hover:text-[#5C3500]",
        // Destructive
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        // Link
        link:
          "text-[#5C3500] underline-offset-4 hover:underline",
        // Secondary = amber tint
        secondary:
          "bg-[#FBF5EC] text-[#5C3500] border border-[#D9B88A] hover:shadow-[0_0_14px_3px_rgba(255,180,0,0.3)]",
        // Legacy blue — still renderable if explicitly used
        blue:
          "bg-blue-600 text-white hover:bg-blue-700",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded px-3 text-xs",
        lg: "h-10 rounded px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }