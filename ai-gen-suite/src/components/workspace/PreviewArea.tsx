"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ImageIcon,
  Loader2,
  Maximize2,
  Download,
  Trash2,
  Share2
} from 'lucide-react';

interface PreviewAreaProps {
  isGenerating: boolean;
  progress: number;
  generatedImage: string | null;
  prompt: string;
  onReset: () => void;
}

export function PreviewArea({ isGenerating, progress, generatedImage, prompt, onReset }: PreviewAreaProps) {
  return (
    <div className="relative aspect-video w-full rounded-2xl bg-card border border-border shadow-2xl flex flex-col items-center justify-center overflow-hidden group">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      <AnimatePresence mode="wait">
        {!generatedImage && !isGenerating && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center space-y-4 z-10 px-6"
          >
            <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 border border-border shadow-inner">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Visualize your ideas</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your generated masterpiece will appear here. Enter a prompt below to start the creative process.
            </p>
          </motion.div>
        )}

        {isGenerating && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/40 backdrop-blur-md"
          >
            <div className="relative w-24 h-24 mb-8">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-muted/30" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-primary" strokeWidth="8" strokeDasharray="283"
                  animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.2 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-xl">{progress}%</div>
            </div>
            <div className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-card border border-border shadow-2xl">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm font-bold tracking-tight uppercase">Painting your imagination...</span>
            </div>
          </motion.div>
        )}

        {generatedImage && !isGenerating && (
          <motion.div
            key="image"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={generatedImage} alt="Generated AI Art" className="w-full h-full object-cover" />

            {/* Image Overlay Controls */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-6 right-6 flex gap-3">
                <button className="p-3 rounded-xl bg-background/90 backdrop-blur border border-border shadow-xl hover:bg-background transition-all active:scale-95"><Maximize2 className="w-5 h-5" /></button>
                <button className="p-3 rounded-xl bg-background/90 backdrop-blur border border-border shadow-xl hover:bg-background transition-all active:scale-95"><Download className="w-5 h-5" /></button>
                <button
                  onClick={onReset}
                  className="p-3 rounded-xl bg-background/90 backdrop-blur border border-border shadow-xl hover:bg-destructive hover:text-destructive-foreground transition-all active:scale-95"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                <div className="p-4 rounded-xl bg-background/40 backdrop-blur-md border border-white/10 text-white flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-2 italic pr-4">&ldquo;{prompt}&rdquo;</p>
                  </div>
                  <button className="flex-shrink-0 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
