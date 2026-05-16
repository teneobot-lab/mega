import React from "react";
import { Skeleton } from "./skeleton";

interface TableSkeletonProps {
  rowCount?: number;
  columnCount?: number;
}

export function TableSkeleton({
  rowCount = 5,
  columnCount = 6,
}: TableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center space-x-4 border-b border-zinc-100 pb-4 px-4">
        {Array.from({ length: columnCount }).map((_, i) => (
          <Skeleton key={i} className="h-6 flex-1 rounded-md bg-zinc-50" />
        ))}
      </div>
      {Array.from({ length: rowCount }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center space-x-4 py-3 px-4 border-b border-zinc-50 last:border-0"
        >
          {Array.from({ length: columnCount }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={`h-4 flex-1 rounded-sm bg-zinc-50 ${
                colIndex === 0 ? "max-w-[40%]" : ""
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
