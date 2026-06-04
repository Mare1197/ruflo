"use client";

import React from 'react';

import { ChevronDown } from 'lucide-react';

interface SelectProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function Select({ label, options, value, onChange }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-10 bg-card border border-input rounded-md px-3 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all pr-10"
        >
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
