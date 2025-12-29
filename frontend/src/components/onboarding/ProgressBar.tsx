"use client";

import React from "react";
import { cn } from "@/lib/calc-draft-utils";

export default function ProgressBar({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

  const color =
    v < 30 ? "bg-red-500" : v < 70 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className={cn("w-full h-2 rounded bg-gray-200 overflow-hidden", className)}>
      <div className={cn("h-full rounded", color)} style={{ width: `${v}%` }} />
    </div>
  );
}
