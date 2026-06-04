"use client";

import { Shell } from "@/components/layout/Shell";
import { Slider } from "@/components/ui/Slider";
import { Toggle } from "@/components/ui/Toggle";
import { ButtonGrid } from "@/components/ui/ButtonGrid";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PreviewArea } from "@/components/workspace/PreviewArea";
import { PromptBar } from "@/components/workspace/PromptBar";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  History as HistoryIcon,
  LayoutGrid,
  Image as ImageIcon,
  Plus,
  Zap,

  Download,
  Trash2,
  Share2,
  Command,
  Dices,
  Search,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Asset {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}

export default function Home() {
  // Persistence for settings
  const [model, setModel] = useLocalStorage('ai-model', 'SDXL');
  const [sampler, setSampler] = useLocalStorage('ai-sampler', 'Euler a');
  const [aspectRatio, setAspectRatio] = useLocalStorage('ai-aspect', '1:1');
  const [guidance, setGuidance] = useLocalStorage('ai-guidance', 7.5);
  const [steps, setSteps] = useLocalStorage('ai-steps', 30);
  const [seed, setSeed] = useState('-1');
  const [magicPrompt, setMagicPrompt] = useLocalStorage('ai-magic', true);
  const [refiner, setRefiner] = useLocalStorage('ai-refiner', false);

  // Persistence for Assets & History
  const [assets, setAssets] = useLocalStorage<Asset[]>('ai-assets', []);
  const [history, setHistory] = useLocalStorage<string[]>('ai-history', []);

  // Ephemeral State
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = () => {
    if (!prompt || isGenerating) return;
    setIsGenerating(true);
    setProgress(0);
    setGeneratedImage(null);

    if (!history.includes(prompt)) {
      setHistory([prompt, ...history].slice(0, 20));
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          const newUrl = `https://images.unsplash.com/photo-${Math.floor(Math.random() * 100000000)}?q=80&w=2564&auto=format&fit=crop`;
          setGeneratedImage(newUrl);

          const newAsset: Asset = {
            id: Math.random().toString(36).substr(2, 9),
            url: newUrl,
            prompt: prompt,
            timestamp: Date.now()
          };
          setAssets([newAsset, ...assets]);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
  };

  const leftSidebar = (
    <div className="flex flex-col gap-6 h-full">
      <div className="space-y-1">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md bg-primary/10 text-primary font-medium">
          <ImageIcon className="w-4 h-4" />
          <span>Generate</span>
        </button>
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <LayoutGrid className="w-4 h-4" />
          <span>Community</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-3 mb-2 flex-shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">History</h3>
          <HistoryIcon className="w-3 h-3 text-muted-foreground" />
        </div>
        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {history.length === 0 ? (
             <div className="px-3 py-8 text-center border-2 border-dashed border-border rounded-xl mx-1">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">No history yet</p>
             </div>
          ) : (
            history.map((item, i) => (
              <button
                key={i}
                onClick={() => setPrompt(item)}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all truncate group text-left"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors flex-shrink-0" />
                <span className="truncate leading-none">{item}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-border flex-shrink-0">
         <div className="px-3 py-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
               <Zap className="w-3.5 h-3.5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-wider text-primary">Pro Status</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-snug mb-3">You have 842 credits remaining this month.</p>
            <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden">
               <div className="w-3/4 h-full bg-primary"></div>
            </div>
         </div>
      </div>
    </div>
  );

  const rightSidebar = (
    <div className="p-6 space-y-8 pb-24 custom-scrollbar">
      <div className="space-y-3">
        <label className="text-sm font-bold tracking-tight uppercase text-muted-foreground/80">Primary Model</label>
        <div className="grid grid-cols-1 gap-2">
          <button onClick={() => setModel('SDXL')} className={cn("flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all active:scale-[0.98]", model === 'SDXL' ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50")}>
            <div className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", model === 'SDXL' ? "bg-primary/20" : "bg-muted")}><Zap className={cn("w-4 h-4", model === 'SDXL' ? "text-primary" : "text-muted-foreground")} /></div>
              <span className="text-sm font-bold">Stable Diffusion XL</span>
            </div>
            <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full uppercase font-black">Pro</span>
          </button>
          <button onClick={() => setModel('DALLE3')} className={cn("flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all active:scale-[0.98]", model === 'DALLE3' ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border bg-card text-muted-foreground hover:border-muted-foreground/50")}>
            <div className="flex items-center gap-3">
              <div className={cn("p-1.5 rounded-lg", model === 'DALLE3' ? "bg-primary/20" : "bg-muted")}><Command className={cn("w-4 h-4", model === 'DALLE3' ? "text-primary" : "text-muted-foreground")} /></div>
              <span className="text-sm font-bold">DALL-E 3</span>
            </div>
          </button>
        </div>
      </div>
      <ButtonGrid label="Aspect Ratio" options={['1:1', '4:3', '16:9', '9:16', '2:3']} value={aspectRatio} onChange={setAspectRatio} />
      <div className="space-y-6 pt-2">
        <Slider label="Guidance Scale" value={guidance} min={1} max={20} step={0.1} onChange={setGuidance} />
        <Slider label="Quality Steps" value={steps} min={10} max={100} onChange={setSteps} />
      </div>
      <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border">
        <Select label="Sampling Method" options={['Euler a', 'Euler', 'LMS', 'Heun', 'DPM2', 'DPM++ 2M', 'DDIM']} value={sampler} onChange={setSampler} />
        <div className="relative group">
           <Input label="Seed" value={seed} onChange={(e) => setSeed(e.target.value)} className="pr-10 font-mono" />
           <button onClick={() => setSeed(Math.floor(Math.random() * 100000000).toString())} className="absolute bottom-2.5 right-3 p-1 rounded-md hover:bg-accent text-muted-foreground transition-colors"><Dices className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="space-y-4 pt-6 border-t border-border">
        <Toggle label="Magic Prompt" description="Auto-enhance descriptions with AI" enabled={magicPrompt} onChange={setMagicPrompt} />
        <Toggle label="Image Refiner" description="Upscale and add fine-grained detail" enabled={refiner} onChange={setRefiner} />
      </div>
    </div>
  );

  return (
    <Shell leftSidebar={leftSidebar} rightSidebar={rightSidebar}>
      <div className="p-8 max-w-6xl mx-auto min-h-full flex flex-col">
        <div className="flex flex-col gap-8">
          <PreviewArea
            isGenerating={isGenerating}
            progress={progress}
            generatedImage={generatedImage}
            prompt={prompt}
            onReset={() => { setGeneratedImage(null); }}
          />

          <PromptBar
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            magicPromptActive={magicPrompt}
          />
        </div>

        <div className="mt-20 pb-12">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-accent shadow-sm border border-border">
                   <ImageIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-2xl tracking-tight">Saved Assets</h3>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 bg-muted/50 rounded-full px-4 py-1.5 border border-border">
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <input type="text" placeholder="Search prompts..." className="bg-transparent border-none focus:ring-0 text-xs w-32" />
                 </div>
                 <button className="text-sm text-primary font-black hover:underline underline-offset-4 decoration-2">View All ({assets.length})</button>
              </div>
           </div>

           {assets.length === 0 ? (
             <div className="aspect-[4/1] w-full rounded-3xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <AlertCircle className="w-8 h-8 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs opacity-40">Your gallery is currently empty</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                <AnimatePresence>
                  {assets.map((asset) => (
                    <motion.div
                      layout
                      key={asset.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ y: -6, scale: 1.02 }}
                      className="aspect-square rounded-2xl bg-muted/30 border border-border overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                          <p className="text-[10px] text-white/90 font-bold mb-3 truncate italic leading-none">&ldquo;{asset.prompt}&rdquo;</p>
                          <div className="flex gap-2">
                            <button className="flex-1 p-2 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"><Share2 className="w-3.5 h-3.5 text-white mx-auto" /></button>
                            <button className="flex-1 p-2 rounded-lg bg-white/10 backdrop-blur hover:bg-white/20 transition-colors"><Download className="w-3.5 h-3.5 text-white mx-auto" /></button>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                              className="flex-1 p-2 rounded-lg bg-destructive/50 backdrop-blur hover:bg-destructive transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-white mx-auto" />
                            </button>
                          </div>
                      </div>
                    </motion.div>
                  ))}
                  <motion.button
                    layout
                    className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-black text-muted-foreground group-hover:text-primary transition-colors uppercase tracking-widest">Add New</span>
                  </motion.button>
                </AnimatePresence>
             </div>
           )}
        </div>
      </div>
    </Shell>
  );
}
