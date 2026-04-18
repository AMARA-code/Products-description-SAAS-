"use client";

import { cn } from "@/lib/utils";
import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";

type ButtonProps = HTMLMotionProps<"button"> & {
  variant?: "primary" | "ghost" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-40";
    const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
      primary:
        "text-white shadow-[var(--button-primary-shadow)] hover:shadow-[var(--button-primary-shadow-hover)] hover:saturate-110",
      ghost:
        "bg-transparent text-foreground/90 hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[color-mix(in_srgb,var(--accent)_70%,var(--foreground))]",
      outline:
        "border border-[color-mix(in_srgb,var(--accent)_35%,transparent)] bg-card text-foreground hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)]",
      danger: "bg-danger/90 text-white hover:bg-danger",
    };
    const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
      sm: "h-9 px-3 text-sm",
      md: "h-11 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    const variantKey = variant as keyof typeof variants;
    const sizeKey = size as keyof typeof sizes;

    const baseStyle =
      variantKey === "primary"
        ? ({
            background:
              "linear-gradient(90deg, var(--brand-from), var(--brand-via), var(--brand-to))",
            ...(props.style ?? {}),
          } as React.CSSProperties)
        : props.style;

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        className={cn(base, variants[variantKey], sizes[sizeKey], className)}
        style={baseStyle}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
