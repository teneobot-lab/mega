import React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  className,
}: ErrorMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6 shadow-inner border border-red-100">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-zinc-900 mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-red-500 font-medium mb-6 max-w-sm italic">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="rounded-full px-6 font-bold gap-2 text-zinc-600 hover:text-red-600 transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
