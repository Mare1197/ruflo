"use client";

import React, { useState } from 'react';
import {
  Plus,
  Layers,
  Sparkles,
  Loader2,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PromptBarProps {
  prompt: string;
  setPrompt: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  magicPromptActive: boolean;
}

export function PromptBar({ prompt, setPrompt, onGenerate, isGenerating, magicPromptActive }: PromptBarProps) {
  const [showNegative, setShowNegative] = useState(false);
  const [negativePrompt, setNegativePrompt] = useState('');

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500"></div>
      <div className="relative bg-card border border-border rounded-xl p-5 flex flex-col gap-4 shadow-2xl">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to see... e.g. 'An ancient library hidden inside a giant glowing mushroom, hyper-realistic, 8k'"
            className="w-full h-24 bg-transparent border-none focus:ring-0 resize-none text-xl placeholder:text-muted-foreground/30 leading-relaxed pr-10"
          />
          {prompt && !isGenerating && (
            <button onClick={() => setPrompt('')} className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-foreground transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {showNegative && (
          <div className="pt-2 border-t border-border/50">
             <label className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-1 block">Negative Prompt</label>
             <textarea
               value={negativePrompt}
               onChange={(e) => setNegativePrompt(e.target.value)}
               placeholder="Ugly, blurry, low quality, distorted, extra limbs..."
               className="w-full h-12 bg-transparent border-none focus:ring-0 resize-none text-sm text-muted-foreground placeholder:text-muted-foreground/20"
             />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between border-t border-border pt-4 gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNegative(!showNegative)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border",
                showNegative ? "bg-primary/10 border-primary/30 text-primary" : "bg-accent border-border/50 hover:bg-accent/80"
              )}
            >
              <Plus className={cn("w-3.5 h-3.5", showNegative ? "text-primary" : "text-muted-foreground")} />
              Negative Prompt
            </button>
            <div className="relative">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-xs font-bold hover:bg-accent/80 transition-all border border-border/50">
                <Layers className="w-3.5 h-3.5 text-primary" />
                Style: Cinematic
                <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </button>
            </div>
            {magicPromptActive && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider animate-pulse">
                <Sparkles className="w-3 h-3" /> Magic Active
              </div>
            )}
          </div>

          <button
            onClick={onGenerate}
            disabled={!prompt || isGenerating}
            className={cn(
              "flex items-center gap-3 px-10 py-3.5 rounded-xl font-black transition-all shadow-xl active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 uppercase tracking-tight",
              isGenerating ? "bg-muted text-muted-foreground cursor-wait" : "bg-primary text-primary-foreground hover:shadow-primary/30 hover:-translate-y-0.5"
            )}
          >
            {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating</> : <><Sparkles className="w-5 h-5" /> Generate</>}
          </button>
        </div>
      </div>
    </div>
  );
}
