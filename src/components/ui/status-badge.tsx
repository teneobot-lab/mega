import React from "react";
import { cn } from "../../lib/utils";

interface StatusBadgeProps {
  status: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

export function StatusBadge({
  status,
  variant = "default",
  className,
}: StatusBadgeProps) {
  const variants = {
    default: "bg-zinc-100 text-zinc-600 border-zinc-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    error: "bg-red-50 text-red-700 border-red-100",
    info: "bg-blue-50 text-blue-700 border-blue-100",
  };

  const getVariant = (s: string): keyof typeof variants => {
    const lowerStatus = s.toLowerCase();
    if (["approved", "paid", "success", "active", "completed"].includes(lowerStatus)) return "success";
    if (["draft", "pending", "on_process"].includes(lowerStatus)) return "warning";
    if (["rejected", "cancelled", "overdue", "failed"].includes(lowerStatus)) return "error";
    if (["shipped", "partial", "posted"].includes(lowerStatus)) return "info";
    return variant;
  };

  const v = getVariant(status);

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm inline-flex items-center justify-center",
        variants[v],
        className
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
