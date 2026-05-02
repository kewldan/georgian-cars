import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-border bg-transparent",
        accent: "bg-accent text-accent-foreground",
        great: "bg-green-600 text-white",
        good: "bg-lime-600 text-white",
        fair: "bg-white text-neutral-900 border border-neutral-200",
        high: "bg-amber-500 text-white",
        overpriced: "bg-red-600 text-white",
        tg: "bg-[#229ED9] text-white",
        new: "bg-accent text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
