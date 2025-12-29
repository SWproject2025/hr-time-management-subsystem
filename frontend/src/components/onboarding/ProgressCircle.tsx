"use client";

import React from "react";
import { cn } from "@/lib/calc-draft-utils";

type Props = {
  value: number; // 0-100
  size?: number; // px
  strokeWidth?: number;
  className?: string;
};

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export default function ProgressCircle({
  value,
  size = 72,
  strokeWidth = 8,
  className,
}: Props) {
  const v = clamp(value);
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      aria-label={`Progress ${v}%`}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          className="stroke-gray-200"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          className="stroke-blue-600"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
      </svg>

      <div className="absolute text-sm font-semibold">{v}%</div>
    </div>
  );
}
