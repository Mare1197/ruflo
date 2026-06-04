"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  User,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ShellProps {
  children: React.ReactNode;
  leftSidebar: React.ReactNode;
  rightSidebar: React.ReactNode;
}

export function Shell({ children, leftSidebar, rightSidebar }: ShellProps) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;

      if (mobile) {
        setLeftOpen(false);
        setRightOpen(false);
      } else {
        setLeftOpen(true);
        setRightOpen(true);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-md z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
           </div>
           <span className="font-bold tracking-tight">AI Studio</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-accent"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lg:hidden fixed inset-0 top-16 bg-background z-40 overflow-y-auto p-6"
          >
             <div className="space-y-8">
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Navigation</h3>
                   {leftSidebar}
                </div>
                <div className="pt-8 border-t border-border">
                   <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Generation Settings</h3>
                   {rightSidebar}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex relative flex-col border-r border-border bg-card transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 shadow-xl",
          leftOpen ? "w-72" : "w-20"
        )}
      >
        <div className="flex items-center h-20 px-6 border-b border-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            {leftOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-black text-xl tracking-tighter truncate"
              >
                AI STUDIO
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
          {leftSidebar}
        </div>

        <div className="p-4 border-t border-border">
           <button
            onClick={() => setLeftOpen(!leftOpen)}
            className="flex items-center justify-center w-full h-12 rounded-xl hover:bg-accent transition-all active:scale-95 group"
           >
             {leftOpen ? <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" /> : <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />}
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
        <header className="hidden lg:flex h-20 border-b border-border bg-card/30 backdrop-blur-md items-center justify-between px-8 z-10">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              <span>Workspace</span>
              <span className="opacity-30">/</span>
              <span className="text-foreground">Untitled Project</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-background bg-accent flex items-center justify-center overflow-hidden ring-1 ring-border">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                ))}
                <button className="w-9 h-9 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 hover:bg-primary/20 transition-colors">
                  <Plus className="w-5 h-5 text-primary" />
                </button>
             </div>
             <button className="h-11 px-8 rounded-xl bg-primary text-primary-foreground text-sm font-black hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20">
                SHARE
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto relative custom-scrollbar pt-16 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* Right Sidebar - Desktop */}
      <aside
        className={cn(
          "hidden lg:flex relative flex-col border-l border-border bg-card transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-20 shadow-2xl",
          rightOpen ? "w-80" : "w-0 border-l-0"
        )}
      >
        <AnimatePresence>
          {rightOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full overflow-hidden"
            >
               <div className="flex items-center h-20 px-8 border-b border-border flex-shrink-0">
                 <h2 className="font-black text-xs uppercase tracking-[0.2em]">Settings</h2>
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar">
                 {rightSidebar}
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setRightOpen(!rightOpen)}
          className={cn(
            "absolute top-24 -left-5 w-10 h-10 rounded-full bg-card border border-border shadow-2xl flex items-center justify-center hover:bg-accent transition-all z-30 active:scale-90 group",
            !rightOpen && "left-auto -right-12"
          )}
        >
          {rightOpen ? <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" /> : <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />}
        </button>
      </aside>
    </div>
  );
}
