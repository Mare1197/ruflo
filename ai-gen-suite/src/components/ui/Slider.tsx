"use client";

import React from 'react';


interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  suffix?: string;
}

export function Slider({ label, value, min, max, step = 1, onChange, suffix = '' }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-foreground/80">{label}</label>
        <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{value}{suffix}</span>
      </div>
      <div className="relative h-6 flex items-center group touch-none">
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-150 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-4 h-4 bg-primary rounded-full border-2 border-background shadow-sm transition-all duration-150 pointer-events-none group-hover:scale-110"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}
