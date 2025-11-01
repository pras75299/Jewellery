"use client";

import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
}

export default function GradientText({ children, className }: GradientTextProps) {
  return (
    <span
      className={cn(
        "bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent",
        className
      )}
    >
      {children}
    </span>
  );
}
