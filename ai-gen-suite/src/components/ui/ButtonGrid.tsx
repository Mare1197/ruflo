"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonGridProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  columns?: number;
}

export function ButtonGrid({ label, options, value, onChange, columns = 3 }: ButtonGridProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={cn(
              "h-10 rounded-md border text-xs font-medium transition-all active:scale-[0.97]",
              value === option
                ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                : "border-border bg-card hover:border-muted-foreground text-muted-foreground hover:text-foreground"
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
