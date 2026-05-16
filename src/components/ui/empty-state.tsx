import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center",
        className
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 text-zinc-400 mb-6 shadow-inner border border-zinc-100">
        {icon || <FolderOpen className="h-10 w-10" />}
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 mb-8 max-w-sm font-medium leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="rounded-full px-8 font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
