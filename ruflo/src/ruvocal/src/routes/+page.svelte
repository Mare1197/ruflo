<script lang="ts">
	type StudioTab = "generate" | "reference" | "edit" | "settings";
	type StylePreset = "cinematic" | "editorial" | "isometric" | "product" | "anime" | "analog";
	type AspectRatio = "1:1" | "4:5" | "16:9" | "9:16";
	type Quality = "draft" | "standard" | "ultra";
	type HistoryItem = {
		id: number;
		prompt: string;
		style: StylePreset;
		url: string;
		time: string;
	};

	const tabs: { id: StudioTab; label: string; helper: string }[] = [
		{ id: "generate", label: "Generate", helper: "Text to image" },
		{ id: "reference", label: "Reference", helper: "Image guidance" },
		{ id: "edit", label: "Edit", helper: "Mask & refine" },
		{ id: "settings", label: "Settings", helper: "Output controls" },
	];

	const stylePresets: { id: StylePreset; label: string; description: string; accent: string }[] = [
		{
			id: "cinematic",
			label: "Cinematic",
			description: "Moody lighting, depth of field, dramatic color grading.",
			accent: "from-violet-500 to-cyan-400",
		},
		{
			id: "editorial",
			label: "Editorial",
			description: "Clean magazine layouts with refined shadows and premium styling.",
			accent: "from-rose-500 to-orange-300",
		},
		{
			id: "isometric",
			label: "Isometric",
			description: "Precise 3D blocks, soft gradients, and playful technical detail.",
			accent: "from-sky-500 to-emerald-300",
		},
		{
			id: "product",
			label: "Product",
			description: "Studio lighting, realistic reflections, polished commercial framing.",
			accent: "from-amber-400 to-lime-300",
		},
		{
			id: "anime",
			label: "Anime",
			description: "Expressive linework, bright color harmony, illustrated detail.",
			accent: "from-fuchsia-500 to-pink-300",
		},
		{
			id: "analog",
			label: "Analog",
			description: "Film grain, warm highlights, subtle imperfections, archival feel.",
			accent: "from-stone-400 to-yellow-200",
		},
	];

	const aspectRatios: { id: AspectRatio; label: string }[] = [
		{ id: "1:1", label: "Square" },
		{ id: "4:5", label: "Portrait" },
		{ id: "16:9", label: "Wide" },
		{ id: "9:16", label: "Story" },
	];

	const models = ["Aurora XL", "Flux Studio", "Vision Pro", "DreamForge"];
	const negativeChips = ["blurry", "extra fingers", "watermark", "low contrast", "cropped"];
	const promptIdeas = [
		"A glass observatory in a neon rainforest at blue hour",
		"Premium headphones floating above a reflective obsidian plinth",
		"A friendly robot painter inside a sunlit ceramic studio",
		"A compact electric city car parked beside a lunar cafe",
	];

	let activeTab: StudioTab = $state("generate");
	let prompt = $state("A futuristic creative studio for AI image generation, glowing panels, polished controls, premium dark interface");
	let negativePrompt = $state("blurry, low quality, distorted text");
	let style: StylePreset = $state("cinematic");
	let aspectRatio: AspectRatio = $state("16:9");
	let quality: Quality = $state("standard");
	let model = $state(models[0]);
	let images = $state(4);
	let creativity = $state(68);
	let guidance = $state(7.5);
	let seed = $state(24801);
	let removeBackground = $state(false);
	let privateMode = $state(true);
	let upscale = $state(false);
	let safety = $state(true);
	let referenceStrength = $state(54);
	let brushSize = $state(32);
	let maskMode = $state("Replace object");
	let selectedPreview = $state(0);
	let isGenerating = $state(false);
	let progress = $state(0);
	let referenceImage = $state<string | null>(null);
	let generated = $state<string[]>([]);
	let history = $state<HistoryItem[]>([]);
	let toast = $state("");
	let queue = $state(["Prompt analysis", "Style transfer", "Lighting pass"]);

	let selectedStyle = $derived(stylePresets.find((preset) => preset.id === style) ?? stylePresets[0]);
	let previewFrame = $derived(aspectRatio === "16:9" ? "aspect-video" : aspectRatio === "9:16" ? "aspect-[9/16]" : aspectRatio === "4:5" ? "aspect-[4/5]" : "aspect-square");
	let promptScore = $derived(Math.min(98, Math.max(42, prompt.length + creativity / 2 - negativePrompt.length / 5)));
	let estimatedTime = $derived(quality === "ultra" ? images * 12 : quality === "standard" ? images * 7 : images * 3);

	function showToast(message: string) {
		toast = message;
		setTimeout(() => {
			if (toast === message) toast = "";
		}, 2600);
	}

	function addNegativeChip(chip: string) {
		if (!negativePrompt.includes(chip)) {
			negativePrompt = negativePrompt ? `${negativePrompt}, ${chip}` : chip;
		}
		showToast(`Added “${chip}” to exclusions`);
	}

	function applyPromptIdea(idea: string) {
		prompt = idea;
		activeTab = "generate";
		showToast("Prompt idea loaded");
	}

	function randomizeSeed() {
		seed = Math.floor(Math.random() * 99999);
		showToast(`Seed set to ${seed}`);
	}

	function makeSvg(index: number) {
		const palette = {
			cinematic: ["#15162b", "#6d5dfc", "#20d6ff"],
			editorial: ["#23111a", "#fb477e", "#ffb86b"],
			isometric: ["#071b2c", "#20a7ff", "#5ef6aa"],
			product: ["#1c1607", "#ffd166", "#d9ff7a"],
			anime: ["#210c32", "#f65cfa", "#ff9acb"],
			analog: ["#211f1c", "#c2a37a", "#ffe8a3"],
		}[style];
		const [bg, primary, secondary] = palette;
		const title = prompt.slice(0, 62).replace(/[<>&]/g, "");
		const sizeLabel = `${model} · ${quality} · ${aspectRatio}`;
		return `data:image/svg+xml;utf8,${encodeURIComponent(`
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
				<defs>
					<linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
						<stop offset="0" stop-color="${bg}"/>
						<stop offset="0.55" stop-color="#080b14"/>
						<stop offset="1" stop-color="${primary}" stop-opacity=".8"/>
					</linearGradient>
					<radialGradient id="orb" cx="45%" cy="38%" r="50%">
						<stop offset="0" stop-color="${secondary}" stop-opacity=".92"/>
						<stop offset=".42" stop-color="${primary}" stop-opacity=".58"/>
						<stop offset="1" stop-color="${bg}" stop-opacity="0"/>
					</radialGradient>
					<filter id="blur"><feGaussianBlur stdDeviation="22"/></filter>
				</defs>
				<rect width="1200" height="900" rx="54" fill="url(#g)"/>
				<circle cx="${360 + index * 92}" cy="${280 + index * 28}" r="260" fill="url(#orb)" filter="url(#blur)"/>
				<g opacity=".72" fill="none" stroke="white" stroke-opacity=".18">
					<path d="M120 665 C340 500 475 770 730 570 S1000 445 1100 610" stroke-width="4"/>
					<path d="M160 240 L1030 140 L1085 685 L235 760 Z" stroke-width="2"/>
				</g>
				<g transform="translate(${255 + index * 36} ${210 + index * 12}) rotate(${index * 5 - 6})">
					<rect width="560" height="390" rx="42" fill="white" fill-opacity=".12" stroke="white" stroke-opacity=".35"/>
					<rect x="36" y="42" width="488" height="226" rx="30" fill="${primary}" fill-opacity=".42"/>
					<circle cx="150" cy="145" r="72" fill="${secondary}" fill-opacity=".85"/>
					<path d="M78 278 C160 222 244 306 326 248 C403 194 454 262 520 216 L520 332 L78 332 Z" fill="${secondary}" fill-opacity=".58"/>
				</g>
				<g font-family="Inter, Arial, sans-serif" fill="white">
					<text x="74" y="790" font-size="38" font-weight="800">${title || "Untitled generation"}</text>
					<text x="76" y="838" font-size="22" fill-opacity=".72">${sizeLabel} · seed ${seed + index}</text>
				</g>
			</svg>`)};`;
	}

	async function generateImages() {
		if (!prompt.trim()) {
			showToast("Describe what you want to create first");
			return;
		}

		isGenerating = true;
		progress = 0;
		queue = ["Prompt analysis", "Composition", "Style pass", "Detail refinement", "Export ready"];
		const totalSteps = quality === "ultra" ? 8 : quality === "standard" ? 6 : 4;
		for (let step = 1; step <= totalSteps; step += 1) {
			await new Promise((resolve) => setTimeout(resolve, 180));
			progress = Math.round((step / totalSteps) * 100);
		}

		generated = Array.from({ length: images }, (_, index) => makeSvg(index));
		selectedPreview = 0;
		history = [
			{
				id: Date.now(),
				prompt,
				style,
				url: generated[0],
				time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
			},
			...history,
		].slice(0, 8);
		isGenerating = false;
		showToast("Generation complete");
	}

	function enhancePrompt() {
		prompt = `${prompt.trim()}, ultra detailed, coherent composition, professional lighting, refined color palette, award-winning art direction`;
		showToast("Prompt enhanced");
	}

	function downloadSelected() {
		const selected = generated[selectedPreview];
		if (!selected) {
			showToast("Generate an image before downloading");
			return;
		}
		const link = document.createElement("a");
		link.href = selected;
		link.download = `aurora-generation-${selectedPreview + 1}.svg`;
		link.click();
		showToast("Download started");
	}

	function duplicateSelected() {
		const selected = generated[selectedPreview];
		if (!selected) {
			showToast("Nothing to duplicate yet");
			return;
		}
		generated = [...generated, selected];
		selectedPreview = generated.length - 1;
		showToast("Variant duplicated");
	}

	function clearCanvas() {
		generated = [];
		selectedPreview = 0;
		showToast("Canvas cleared");
	}

	function useHistory(item: HistoryItem) {
		prompt = item.prompt;
		style = item.style;
		generated = [item.url];
		selectedPreview = 0;
		showToast("History item restored");
	}

	async function handleReferenceUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		referenceImage = await new Promise<string>((resolve) => {
			const reader = new FileReader();
			reader.onload = () => resolve(String(reader.result));
			reader.readAsDataURL(file);
		});
		activeTab = "reference";
		showToast("Reference image loaded");
	}

	function copyPrompt() {
		navigator.clipboard?.writeText(prompt);
		showToast("Prompt copied");
	}
</script>

<svelte:head>
	<title>Aurora Studio — AI Image Generation Suite</title>
	<meta
		name="description"
		content="A responsive AI image-generation suite with interactive prompts, reference controls, previews, history, and export tools."
	/>
</svelte:head>

<main class="min-h-dvh overflow-y-auto bg-[#070912] text-white">
	<div class="pointer-events-none fixed inset-0 opacity-70">
		<div class="absolute left-1/4 top-[-12rem] size-[32rem] rounded-full bg-cyan-500/20 blur-3xl"></div>
		<div class="absolute bottom-[-12rem] right-[-4rem] size-[34rem] rounded-full bg-fuchsia-500/20 blur-3xl"></div>
	</div>

	<section class="relative mx-auto flex min-h-dvh w-full max-w-[1800px] flex-col gap-4 p-3 sm:p-4 lg:p-6">
		<header class="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
			<div class="flex items-center gap-3">
				<div class="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 via-indigo-400 to-fuchsia-500 text-xl font-black shadow-lg shadow-cyan-500/20">A</div>
				<div>
					<p class="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Aurora Studio</p>
					<h1 class="text-2xl font-black tracking-tight sm:text-3xl">AI Image Generation Suite</h1>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
				<button class="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15" type="button" onclick={copyPrompt}>Copy prompt</button>
				<button class="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15" type="button" onclick={randomizeSeed}>Random seed</button>
				<button class="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold transition hover:bg-white/15" type="button" onclick={downloadSelected}>Export</button>
				<button class="rounded-2xl bg-gradient-to-r from-cyan-300 via-blue-400 to-fuchsia-400 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] disabled:cursor-wait disabled:opacity-70" type="button" onclick={generateImages} disabled={isGenerating}>{isGenerating ? "Creating…" : "Generate"}</button>
			</div>
		</header>

		<div class="grid flex-1 gap-4 xl:grid-cols-[360px,minmax(0,1fr),340px]">
			<aside class="rounded-[2rem] border border-white/10 bg-slate-950/70 p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
				<div class="grid grid-cols-2 gap-2">
					{#each tabs as tab}
						<button
							type="button"
							class="rounded-2xl border p-3 text-left transition {activeTab === tab.id ? 'border-cyan-300/60 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/10'}"
							onclick={() => (activeTab = tab.id)}
						>
							<span class="block text-sm font-bold">{tab.label}</span>
							<span class="text-xs">{tab.helper}</span>
						</button>
					{/each}
				</div>

				<div class="mt-4 space-y-4 rounded-[1.5rem] bg-white/[0.04] p-4">
					{#if activeTab === "generate"}
						<label class="space-y-2">
							<span class="text-sm font-bold text-white/85">Prompt</span>
							<textarea class="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-6 outline-none ring-cyan-300/40 transition placeholder:text-white/30 focus:border-cyan-300/60 focus:ring-4" bind:value={prompt}></textarea>
						</label>
						<div class="flex gap-2">
							<button class="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15" type="button" onclick={enhancePrompt}>Enhance</button>
							<button class="flex-1 rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15" type="button" onclick={() => (prompt = "")}>Clear</button>
						</div>
						<div class="space-y-2">
							<p class="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Prompt ideas</p>
							{#each promptIdeas as idea}
								<button class="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left text-xs text-white/70 hover:bg-white/10" type="button" onclick={() => applyPromptIdea(idea)}>{idea}</button>
							{/each}
						</div>
					{:else if activeTab === "reference"}
						<label class="grid cursor-pointer place-items-center rounded-3xl border border-dashed border-cyan-300/40 bg-cyan-300/10 p-6 text-center transition hover:bg-cyan-300/15">
							<input class="sr-only" type="file" accept="image/*" onchange={handleReferenceUpload} />
							{#if referenceImage}
								<img src={referenceImage} alt="Reference" class="mb-3 max-h-44 rounded-2xl object-cover" />
							{/if}
							<span class="text-sm font-bold">Upload or replace reference</span>
							<span class="mt-1 text-xs text-white/55">The preview and guidance controls update immediately.</span>
						</label>
						<label class="space-y-2 text-sm font-bold">Reference strength <span class="float-right text-cyan-200">{referenceStrength}%</span><input class="w-full accent-cyan-300" type="range" min="0" max="100" bind:value={referenceStrength} /></label>
						<button class="w-full rounded-2xl bg-white/10 py-3 text-sm font-bold hover:bg-white/15" type="button" onclick={() => { referenceImage = null; showToast('Reference removed'); }}>Remove reference</button>
					{:else if activeTab === "edit"}
						<label class="space-y-2 text-sm font-bold">Mask mode<select class="w-full rounded-2xl border border-white/10 bg-slate-950 p-3 outline-none" bind:value={maskMode}><option>Replace object</option><option>Expand canvas</option><option>Retouch details</option><option>Erase background</option></select></label>
						<label class="space-y-2 text-sm font-bold">Brush size <span class="float-right text-cyan-200">{brushSize}px</span><input class="w-full accent-fuchsia-300" type="range" min="4" max="96" bind:value={brushSize} /></label>
						<div class="rounded-3xl border border-white/10 bg-black/30 p-4">
							<div class="grid aspect-video place-items-center rounded-2xl bg-[radial-gradient(circle_at_center,rgba(34,211,238,.25),transparent_55%)] text-center text-sm text-white/60">
								<div class="rounded-full border-2 border-dashed border-fuchsia-300/80" style={`width:${brushSize * 2}px;height:${brushSize * 2}px`}></div>
							</div>
							<p class="mt-3 text-xs text-white/55">Live mask cursor preview for {maskMode.toLowerCase()}.</p>
						</div>
					{:else}
						<label class="space-y-2 text-sm font-bold">Model<select class="w-full rounded-2xl border border-white/10 bg-slate-950 p-3 outline-none" bind:value={model}>{#each models as item}<option>{item}</option>{/each}</select></label>
						<label class="space-y-2 text-sm font-bold">Quality<select class="w-full rounded-2xl border border-white/10 bg-slate-950 p-3 outline-none" bind:value={quality}><option value="draft">Draft</option><option value="standard">Standard</option><option value="ultra">Ultra</option></select></label>
						<div class="grid grid-cols-2 gap-2">
							{#each aspectRatios as ratio}
								<button type="button" class="rounded-2xl border p-3 text-sm font-bold transition {aspectRatio === ratio.id ? 'border-fuchsia-300/60 bg-fuchsia-300/15' : 'border-white/10 bg-white/[0.04] hover:bg-white/10'}" onclick={() => (aspectRatio = ratio.id)}>{ratio.label}<span class="block text-xs font-normal text-white/50">{ratio.id}</span></button>
							{/each}
						</div>
					{/if}
				</div>
			</aside>

			<section class="flex min-h-[620px] flex-col rounded-[2rem] border border-white/10 bg-white/[0.05] p-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-4">
				<div class="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.3em] text-white/45">Creative canvas</p>
						<h2 class="text-xl font-black">{generated.length ? `${generated.length} generated variants` : "Ready to generate"}</h2>
					</div>
					<div class="flex flex-wrap gap-2">
						<button class="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15" type="button" onclick={duplicateSelected}>Duplicate</button>
						<button class="rounded-2xl bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15" type="button" onclick={clearCanvas}>Clear</button>
					</div>
				</div>

				{#if isGenerating}
					<div class="grid flex-1 place-items-center rounded-[1.5rem] border border-white/10 bg-black/30 p-8 text-center">
						<div class="w-full max-w-md">
							<div class="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-cyan-300/10 text-3xl">✨</div>
							<h3 class="text-2xl font-black">Rendering your image set</h3>
							<div class="mt-6 h-3 overflow-hidden rounded-full bg-white/10"><div class="h-full rounded-full bg-gradient-to-r from-cyan-300 to-fuchsia-400 transition-all" style={`width:${progress}%`}></div></div>
							<p class="mt-3 text-sm text-white/55">{progress}% complete · {queue[Math.min(queue.length - 1, Math.floor(progress / 25))]}</p>
						</div>
					</div>
				{:else if generated.length}
					<div class="grid flex-1 gap-3 md:grid-cols-2">
						{#each generated as image, index}
							<button type="button" class="group relative overflow-hidden rounded-[1.5rem] border text-left transition {selectedPreview === index ? 'border-cyan-300 shadow-xl shadow-cyan-500/20' : 'border-white/10 hover:border-white/30'}" onclick={() => (selectedPreview = index)}>
								<img src={image} alt={`Generated variant ${index + 1}`} class="h-full min-h-56 w-full object-cover" />
								<div class="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-2xl bg-black/50 p-3 text-xs font-bold backdrop-blur-xl"><span>Variant {index + 1}</span><span>{selectedPreview === index ? "Selected" : "Preview"}</span></div>
							</button>
						{/each}
					</div>
				{:else}
					<div class="grid flex-1 place-items-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_25%_10%,rgba(34,211,238,.24),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(217,70,239,.20),transparent_40%),#090d18] p-8 text-center">
						<div class="max-w-xl">
							<div class="mx-auto mb-6 grid {previewFrame} w-full max-w-md place-items-center rounded-[2rem] border border-white/15 bg-white/[0.06] p-8 shadow-2xl shadow-black/30">
								<div class="text-6xl">🎨</div>
							</div>
							<h3 class="text-3xl font-black">Describe an image, tune the controls, then generate.</h3>
							<p class="mt-3 text-white/60">This local studio creates downloadable SVG previews using your prompt, model, style, seed, quality, and aspect settings.</p>
						</div>
					</div>
				{/if}
			</section>

			<aside class="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl">
				<section>
					<div class="mb-3 flex items-center justify-between"><h2 class="font-black">Style lab</h2><span class="rounded-full bg-white/10 px-3 py-1 text-xs">{selectedStyle.label}</span></div>
					<div class="grid gap-2">
						{#each stylePresets as preset}
							<button type="button" class="rounded-2xl border p-3 text-left transition {style === preset.id ? 'border-cyan-300/60 bg-white/12' : 'border-white/10 bg-white/[0.04] hover:bg-white/10'}" onclick={() => (style = preset.id)}>
								<span class={`mb-2 block h-2 rounded-full bg-gradient-to-r ${preset.accent}`}></span>
								<span class="block text-sm font-black">{preset.label}</span>
								<span class="text-xs text-white/50">{preset.description}</span>
							</button>
						{/each}
					</div>
				</section>

				<section class="space-y-3 rounded-[1.5rem] bg-white/[0.04] p-4">
					<div class="flex items-center justify-between text-sm font-bold"><span>Images</span><span>{images}</span></div><input class="w-full accent-cyan-300" type="range" min="1" max="6" bind:value={images} />
					<div class="flex items-center justify-between text-sm font-bold"><span>Creativity</span><span>{creativity}%</span></div><input class="w-full accent-fuchsia-300" type="range" min="0" max="100" bind:value={creativity} />
					<div class="flex items-center justify-between text-sm font-bold"><span>Guidance</span><span>{guidance}</span></div><input class="w-full accent-blue-300" type="range" min="1" max="15" step="0.5" bind:value={guidance} />
					<div class="grid grid-cols-2 gap-2 pt-2 text-center text-xs text-white/60"><div class="rounded-2xl bg-black/25 p-3"><b class="block text-lg text-white">{Math.round(promptScore)}</b>Prompt score</div><div class="rounded-2xl bg-black/25 p-3"><b class="block text-lg text-white">~{estimatedTime}s</b>Est. time</div></div>
				</section>

				<section class="space-y-2">
					<label class="block text-sm font-bold">Negative prompt<textarea class="mt-2 min-h-20 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-3 text-sm outline-none focus:border-cyan-300/60" bind:value={negativePrompt}></textarea></label>
					<div class="flex flex-wrap gap-2">{#each negativeChips as chip}<button class="rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/15" type="button" onclick={() => addNegativeChip(chip)}>{chip}</button>{/each}</div>
				</section>

				<section class="grid gap-2 text-sm font-bold">
					<label class="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3">Private mode<input type="checkbox" class="accent-cyan-300" bind:checked={privateMode} /></label>
					<label class="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3">Upscale 2×<input type="checkbox" class="accent-cyan-300" bind:checked={upscale} /></label>
					<label class="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3">Remove background<input type="checkbox" class="accent-cyan-300" bind:checked={removeBackground} /></label>
					<label class="flex items-center justify-between rounded-2xl bg-white/[0.04] p-3">Safety filter<input type="checkbox" class="accent-cyan-300" bind:checked={safety} /></label>
				</section>

				<section>
					<h2 class="mb-3 font-black">History</h2>
					<div class="max-h-64 space-y-2 overflow-auto pr-1 scrollbar-thin scrollbar-thumb-white/20">
						{#if history.length === 0}<p class="rounded-2xl bg-white/[0.04] p-4 text-sm text-white/50">Generated images appear here for quick restore.</p>{/if}
						{#each history as item}
							<button class="flex w-full gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 text-left hover:bg-white/10" type="button" onclick={() => useHistory(item)}><img src={item.url} alt="History thumbnail" class="size-14 rounded-xl object-cover" /><span class="min-w-0 text-xs"><b class="block truncate text-sm">{item.prompt}</b><span class="text-white/50">{item.time} · {item.style}</span></span></button>
						{/each}
					</div>
				</section>
			</aside>
		</div>
	</section>

	{#if toast}
		<div class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-white/10 bg-slate-950/90 px-5 py-3 text-sm font-bold shadow-2xl backdrop-blur-xl">{toast}</div>
	{/if}
</main>
