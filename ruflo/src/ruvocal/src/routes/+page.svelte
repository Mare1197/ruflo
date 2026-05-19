<script lang="ts">
	import { browser } from "$app/environment";
	import { usePublicConfig } from "$lib/utils/PublicConfig.svelte";

	const publicConfig = usePublicConfig();

	type Mode = "text" | "image" | "edit" | "upscale";
	type JobStatus = "Queued" | "Rendering" | "Complete";
	type GeneratedImage = {
		id: number;
		prompt: string;
		style: string;
		mode: Mode;
		url: string;
		createdAt: string;
		seed: number;
		favorite: boolean;
		resolution: string;
	};
	type QueueJob = {
		id: number;
		label: string;
		status: JobStatus;
		progress: number;
	};

	const modes: Array<{ id: Mode; label: string; description: string }> = [
		{ id: "text", label: "Text to image", description: "Create from a written prompt" },
		{ id: "image", label: "Image to image", description: "Transform a reference image" },
		{ id: "edit", label: "Inpaint / edit", description: "Revise selected regions" },
		{ id: "upscale", label: "Upscale", description: "Enhance detail and size" },
	];

	const modelOptions = ["Aurora XL", "Flux Pro", "DreamForge 3", "Pixel Muse", "Studio Realism"];
	const styleOptions = ["Cinematic", "Photoreal", "Anime", "3D Render", "Editorial", "Watercolor"];
	const ratioOptions = ["1:1", "16:9", "9:16", "4:3", "3:2"];
	const qualityOptions = ["Draft", "Balanced", "Ultra"];
	const colorPalettes = [
		["#8b5cf6", "#22d3ee", "#f97316"],
		["#06b6d4", "#14b8a6", "#84cc16"],
		["#ec4899", "#f43f5e", "#f59e0b"],
		["#111827", "#64748b", "#f8fafc"],
	];

	let activeMode = $state<Mode>("text");
	let prompt = $state(
		"A glass observatory floating above a neon rainforest, volumetric lighting, cinematic detail"
	);
	let negativePrompt = $state("blurry, distorted hands, watermark, oversaturated");
	let model = $state(modelOptions[0]);
	let style = $state(styleOptions[0]);
	let ratio = $state(ratioOptions[0]);
	let quality = $state(qualityOptions[1]);
	let imageCount = $state(4);
	let guidance = $state(7.5);
	let steps = $state(34);
	let seed = $state(128934);
	let creativity = $state(62);
	let denoise = $state(44);
	let upscale = $state(2);
	let privateMode = $state(true);
	let tileable = $state(false);
	let highResFix = $state(true);
	let selectedPalette = $state(0);
	let uploadedImage = $state<string | null>(null);
	let isGenerating = $state(false);
	let selectedImageId = $state<number | null>(null);
	let savedPresets = $state<string[]>(["Launch campaign", "Product hero"]);
	let queue = $state<QueueJob[]>([
		{ id: 1, label: "Retouch editorial cover", status: "Complete", progress: 100 },
		{ id: 2, label: "Upscale product renders", status: "Rendering", progress: 68 },
	]);
	let images = $state<GeneratedImage[]>([
		createImage(101, "Bioluminescent city carved into cliffs at blue hour", "Cinematic", "text", 91421),
		createImage(102, "Fashion portrait with liquid chrome makeup and softbox light", "Editorial", "text", 77103),
		createImage(103, "Minimal smart speaker on a warm marble pedestal", "3D Render", "image", 33219),
		createImage(104, "Botanical perfume bottle surrounded by mist and amber petals", "Photoreal", "edit", 51802),
	]);

	let selectedImage = $derived(images.find((image) => image.id === selectedImageId) ?? images[0]);
	let modeDescription = $derived(modes.find((mode) => mode.id === activeMode)?.description ?? "");
	let promptScore = $derived(Math.min(98, Math.max(28, prompt.trim().length + steps + imageCount * 4)));
	let estimatedTime = $derived(
		Math.max(4, Math.round((steps * imageCount * (quality === "Ultra" ? 1.8 : quality === "Balanced" ? 1.2 : 0.7)) / 11))
	);
	let outputResolution = $derived(resolveResolution(ratio, upscale));

	function resolveResolution(currentRatio: string, scale: number) {
		const base: Record<string, [number, number]> = {
			"1:1": [1024, 1024],
			"16:9": [1344, 768],
			"9:16": [768, 1344],
			"4:3": [1152, 864],
			"3:2": [1216, 832],
		};
		const [width, height] = base[currentRatio] ?? base["1:1"];
		return `${width * scale} × ${height * scale}`;
	}

	function paletteCss(index = selectedPalette) {
		const colors = colorPalettes[index] ?? colorPalettes[0];
		return `linear-gradient(135deg, ${colors[0]}, ${colors[1]} 50%, ${colors[2]})`;
	}

	function createImage(id: number, imagePrompt: string, imageStyle: string, imageMode: Mode, imageSeed: number) {
		const palette = colorPalettes[id % colorPalettes.length];
		const title = imagePrompt.replace(/&/g, "and").slice(0, 58);
		const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${palette[0]}"/><stop offset="0.52" stop-color="${palette[1]}"/><stop offset="1" stop-color="${palette[2]}"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="34"/></filter></defs><rect width="1200" height="1200" fill="#080812"/><circle cx="260" cy="240" r="240" fill="${palette[0]}" opacity="0.78" filter="url(#blur)"/><circle cx="920" cy="310" r="300" fill="${palette[1]}" opacity="0.62" filter="url(#blur)"/><circle cx="650" cy="920" r="360" fill="${palette[2]}" opacity="0.58" filter="url(#blur)"/><path d="M190 805 C360 565 520 965 720 650 S980 560 1050 810" fill="none" stroke="rgba(255,255,255,.72)" stroke-width="15" stroke-linecap="round"/><rect x="130" y="130" width="940" height="940" rx="72" fill="url(#g)" opacity="0.2" stroke="rgba(255,255,255,.34)" stroke-width="3"/><g fill="white" font-family="Inter,Arial,sans-serif"><text x="150" y="990" font-size="52" font-weight="800">${imageStyle}</text><text x="150" y="1050" font-size="28" opacity=".82">${title}</text><text x="150" y="1100" font-size="24" opacity=".58">seed ${imageSeed}</text></g></svg>`;
		return {
			id,
			prompt: imagePrompt,
			style: imageStyle,
			mode: imageMode,
			url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
			createdAt: "Just now",
			seed: imageSeed,
			favorite: false,
			resolution: resolveResolution(ratio, imageMode === "upscale" ? upscale : 1),
		};
	}

	function setMode(mode: Mode) {
		activeMode = mode;
		if (mode === "upscale") {
			imageCount = 1;
			quality = "Ultra";
		}
		if (mode === "image" && denoise < 35) denoise = 44;
	}

	function randomizePrompt() {
		const prompts = [
			"A futuristic atelier where robots paint couture dresses under moonlight",
			"A cozy mountain micro-cabin with panoramic glass walls during snowfall",
			"An isometric dashboard made of translucent glass, purple gradients, premium SaaS style",
			"A macro shot of a crystalline hummingbird hovering over electric orchids",
			"A luxury sneaker campaign on reflective black sand with sunrise rim light",
		];
		prompt = prompts[Math.floor(Math.random() * prompts.length)];
		seed = Math.floor(Math.random() * 999999);
	}

	function enhancePrompt() {
		const additions = [
			"award-winning composition",
			"precise material detail",
			"balanced color harmony",
			"clean background separation",
			"professional studio finish",
		];
		prompt = `${prompt.replace(/\.$/, "")}, ${additions.filter((item) => !prompt.includes(item)).slice(0, 3).join(", ")}`;
		guidance = Math.min(12, Number((guidance + 0.7).toFixed(1)));
	}

	function savePreset() {
		const name = `${style} ${ratio} · ${quality}`;
		if (!savedPresets.includes(name)) savedPresets = [name, ...savedPresets].slice(0, 6);
	}

	function applyPreset(preset: string) {
		if (preset.includes("Product")) {
			style = "3D Render";
			ratio = "4:3";
			prompt = "Premium product hero render with soft shadows, clean reflections, commercial polish";
		} else if (preset.includes("Launch")) {
			style = "Cinematic";
			ratio = "16:9";
			prompt = "Bold launch campaign visual with dramatic lighting, elegant typography space, flagship energy";
		} else {
			style = preset.split(" ")[0] || style;
		}
	}

	function clearHistory() {
		images = [];
		selectedImageId = null;
	}

	function toggleFavorite(id: number) {
		images = images.map((image) =>
			image.id === id ? { ...image, favorite: !image.favorite } : image
		);
	}

	function remix(image: GeneratedImage) {
		prompt = `${image.prompt}, remixed with ${style.toLowerCase()} lighting and refined details`;
		seed = image.seed + 17;
		selectedImageId = image.id;
	}

	function useAsReference(image: GeneratedImage) {
		activeMode = "image";
		uploadedImage = image.url;
		prompt = `Use this reference composition and create: ${image.prompt}`;
	}

	function generate() {
		if (!prompt.trim() || isGenerating) return;
		isGenerating = true;
		const jobId = Date.now();
		queue = [{ id: jobId, label: prompt.slice(0, 34), status: "Queued", progress: 4 }, ...queue].slice(0, 5);
		const tick = browser
			? window.setInterval(() => {
					queue = queue.map((job) =>
						job.id === jobId
							? {
									...job,
									status: job.progress > 18 ? "Rendering" : "Queued",
									progress: Math.min(96, job.progress + 12),
								}
							: job
					);
				}, 220)
			: undefined;

		setTimeout(() => {
			if (tick) window.clearInterval(tick);
			const generated = Array.from({ length: imageCount }, (_, index) =>
				createImage(jobId + index, prompt, style, activeMode, seed + index)
			);
			images = [...generated, ...images].slice(0, 18);
			selectedImageId = generated[0]?.id ?? null;
			queue = queue.map((job) =>
				job.id === jobId ? { ...job, status: "Complete", progress: 100 } : job
			);
			isGenerating = false;
		}, 1350);
	}

	function downloadImage(image: GeneratedImage) {
		if (!browser) return;
		const link = document.createElement("a");
		link.href = image.url;
		link.download = `ruflo-${image.id}.svg`;
		link.click();
	}

	function handleUpload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !browser) return;
		const reader = new FileReader();
		reader.onload = () => {
			uploadedImage = String(reader.result);
			activeMode = "image";
		};
		reader.readAsDataURL(file);
	}
</script>

<svelte:head>
	<title>{publicConfig.PUBLIC_APP_NAME} · Image Studio</title>
</svelte:head>

<main class="image-studio min-h-0 overflow-auto bg-[#070812] text-slate-100">
	<section class="studio-shell">
		<header class="hero-panel">
			<div>
				<p class="eyebrow">RuFlo Image Studio</p>
				<h1>Generate, refine, upscale, and ship production-ready AI visuals.</h1>
				<p class="hero-copy">
					A responsive creation suite with live prompt scoring, reference workflows, queue
					management, presets, and downloadable generated previews.
				</p>
			</div>
			<div class="hero-actions">
				<button type="button" class="ghost-button" onclick={randomizePrompt}>Surprise me</button>
				<button type="button" class="primary-button" onclick={generate} disabled={isGenerating || !prompt.trim()}>
					{isGenerating ? "Rendering…" : "Generate"}
				</button>
			</div>
		</header>

		<div class="workspace-grid">
			<aside class="control-panel panel-card">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Workflow</p>
						<h2>Create</h2>
					</div>
					<span class="status-pill">{modeDescription}</span>
				</div>

				<div class="mode-tabs" aria-label="Generation mode">
					{#each modes as mode}
						<button
							type="button"
							class:active={activeMode === mode.id}
							onclick={() => setMode(mode.id)}
							aria-pressed={activeMode === mode.id}
						>
							<strong>{mode.label}</strong>
							<span>{mode.description}</span>
						</button>
					{/each}
				</div>

				<label class="field-stack">
					<span>Prompt</span>
					<textarea bind:value={prompt} rows="5" placeholder="Describe the image you want to create"></textarea>
				</label>
				<div class="prompt-tools">
					<button type="button" onclick={enhancePrompt}>Enhance prompt</button>
					<button type="button" onclick={randomizePrompt}>Randomize</button>
					<span>{promptScore}% prompt strength</span>
				</div>

				<label class="field-stack compact">
					<span>Negative prompt</span>
					<input bind:value={negativePrompt} placeholder="Things to avoid" />
				</label>

				<div class="settings-grid">
					<label class="field-stack compact"><span>Model</span><select bind:value={model}>{#each modelOptions as option}<option>{option}</option>{/each}</select></label>
					<label class="field-stack compact"><span>Style</span><select bind:value={style}>{#each styleOptions as option}<option>{option}</option>{/each}</select></label>
					<label class="field-stack compact"><span>Aspect</span><select bind:value={ratio}>{#each ratioOptions as option}<option>{option}</option>{/each}</select></label>
					<label class="field-stack compact"><span>Quality</span><select bind:value={quality}>{#each qualityOptions as option}<option>{option}</option>{/each}</select></label>
				</div>

				<div class="slider-stack">
					<label><span>Images</span><b>{imageCount}</b><input type="range" min="1" max="6" bind:value={imageCount} /></label>
					<label><span>Guidance</span><b>{guidance}</b><input type="range" min="1" max="14" step="0.5" bind:value={guidance} /></label>
					<label><span>Steps</span><b>{steps}</b><input type="range" min="12" max="60" bind:value={steps} /></label>
					<label><span>Creativity</span><b>{creativity}%</b><input type="range" min="0" max="100" bind:value={creativity} /></label>
					{#if activeMode === "image" || activeMode === "edit"}<label><span>Denoise</span><b>{denoise}%</b><input type="range" min="0" max="100" bind:value={denoise} /></label>{/if}
					{#if activeMode === "upscale"}<label><span>Upscale</span><b>{upscale}×</b><input type="range" min="2" max="4" bind:value={upscale} /></label>{/if}
				</div>

				<div class="reference-dropzone">
					<input id="reference-upload" type="file" accept="image/*" onchange={handleUpload} />
					<label for="reference-upload">
						{#if uploadedImage}
							<img src={uploadedImage} alt="Uploaded reference" />
						{:else}
							<span>＋</span><strong>Add reference image</strong><small>Used by image, edit, and upscale workflows</small>
						{/if}
					</label>
					{#if uploadedImage}<button type="button" onclick={() => (uploadedImage = null)}>Remove reference</button>{/if}
				</div>
			</aside>

			<section class="preview-panel">
				<div class="panel-card preview-stage">
					<div class="preview-toolbar">
						<div><p class="eyebrow">Live canvas</p><h2>{selectedImage ? selectedImage.prompt : "Ready to create"}</h2></div>
						<div class="toolbar-meta"><span>{outputResolution}</span><span>ETA {estimatedTime}s</span></div>
					</div>

					<div class="canvas-wrap" style={`background: ${paletteCss()}`}>
						{#if selectedImage}<img src={selectedImage.url} alt={selectedImage.prompt} />{:else}<div class="empty-canvas">Your generated image will appear here.</div>{/if}
						<div class="canvas-badge">{style} · {model}</div>
					</div>

					<div class="canvas-actions">
						<button type="button" onclick={() => selectedImage && remix(selectedImage)} disabled={!selectedImage}>Remix</button>
						<button type="button" onclick={() => selectedImage && useAsReference(selectedImage)} disabled={!selectedImage}>Use as reference</button>
						<button type="button" onclick={() => selectedImage && toggleFavorite(selectedImage.id)} disabled={!selectedImage}>{selectedImage?.favorite ? "Unfavorite" : "Favorite"}</button>
						<button type="button" class="primary-button small" onclick={() => selectedImage && downloadImage(selectedImage)} disabled={!selectedImage}>Download</button>
					</div>
				</div>

				<div class="gallery-grid">
					{#each images as image}
						<article class="image-card" class:selected={selectedImage?.id === image.id}>
							<button type="button" class="thumb" onclick={() => (selectedImageId = image.id)}><img src={image.url} alt={image.prompt} /><span>{image.resolution}</span></button>
							<div class="card-body"><strong>{image.style}</strong><p>{image.prompt}</p><div><button type="button" onclick={() => toggleFavorite(image.id)}>{image.favorite ? "★" : "☆"}</button><button type="button" onclick={() => remix(image)}>Remix</button><button type="button" onclick={() => downloadImage(image)}>Save</button></div></div>
						</article>
					{/each}
				</div>
			</section>

			<aside class="right-rail panel-card">
				<div class="panel-heading"><div><p class="eyebrow">Settings</p><h2>Production</h2></div><button type="button" class="mini-button" onclick={savePreset}>Save preset</button></div>

				<div class="palette-picker"><span>Palette</span><div>{#each colorPalettes as palette, index}<button type="button" class:active={selectedPalette === index} style={`background: linear-gradient(135deg, ${palette[0]}, ${palette[1]}, ${palette[2]})`} onclick={() => (selectedPalette = index)} aria-label={`Palette ${index + 1}`}></button>{/each}</div></div>

				<div class="toggle-list">
					<label><span><strong>Private generation</strong><small>Hide outputs from shared feeds</small></span><input type="checkbox" bind:checked={privateMode} /></label>
					<label><span><strong>Tileable output</strong><small>Create seamless textures</small></span><input type="checkbox" bind:checked={tileable} /></label>
					<label><span><strong>High-res fix</strong><small>Second-pass detail recovery</small></span><input type="checkbox" bind:checked={highResFix} /></label>
				</div>

				<label class="field-stack compact"><span>Seed</span><div class="seed-row"><input type="number" bind:value={seed} /><button type="button" onclick={() => (seed = Math.floor(Math.random() * 999999))}>Roll</button></div></label>

				<div class="preset-list"><span>Presets</span>{#each savedPresets as preset}<button type="button" onclick={() => applyPreset(preset)}>{preset}</button>{/each}</div>

				<div class="queue-list"><div class="rail-title"><span>Queue</span><button type="button" onclick={() => (queue = [])}>Clear</button></div>{#each queue as job}<div class="queue-item"><div><strong>{job.label}</strong><small>{job.status}</small></div><progress value={job.progress} max="100"></progress></div>{/each}</div>

				<div class="stats-grid"><div><strong>{images.length}</strong><span>Assets</span></div><div><strong>{images.filter((image) => image.favorite).length}</strong><span>Favorites</span></div><div><strong>{estimatedTime}s</strong><span>ETA</span></div></div>
				<button type="button" class="danger-button" onclick={clearHistory}>Clear gallery</button>
			</aside>
		</div>
	</section>
</main>

<style>
	:global(.image-studio) { font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
	.studio-shell { width: min(1680px, 100% - 32px); margin: 0 auto; padding: 24px; }
	.hero-panel, .panel-card { border: 1px solid rgba(148, 163, 184, 0.2); background: linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.64)); box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3); backdrop-filter: blur(22px); }
	.hero-panel { display: flex; align-items: center; justify-content: space-between; gap: 20px; border-radius: 32px; padding: 28px; margin-bottom: 18px; background: radial-gradient(circle at 18% 20%, rgba(139, 92, 246, 0.34), transparent 34%), linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.72)); }
	.eyebrow { margin: 0 0 8px; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #67e8f9; }
	h1, h2, p { margin: 0; }
	h1 { max-width: 780px; font-size: clamp(2rem, 4vw, 4.35rem); line-height: 0.92; letter-spacing: -0.06em; }
	h2 { font-size: 1.05rem; font-weight: 800; letter-spacing: -0.02em; }
	.hero-copy { max-width: 740px; margin-top: 14px; color: #b6c3d6; font-size: 1rem; }
	.hero-actions, .canvas-actions, .prompt-tools { display: flex; gap: 10px; flex-wrap: wrap; }
	.workspace-grid { display: grid; grid-template-columns: minmax(310px, 390px) minmax(0, 1fr) minmax(280px, 340px); gap: 18px; align-items: start; }
	.panel-card { border-radius: 28px; padding: 18px; }
	.control-panel, .right-rail { position: sticky; top: 18px; display: grid; gap: 18px; }
	.panel-heading, .preview-toolbar, .rail-title { display: flex; align-items: center; justify-content: space-between; gap: 14px; }
	.status-pill, .toolbar-meta span { border: 1px solid rgba(103, 232, 249, 0.22); border-radius: 999px; padding: 7px 10px; background: rgba(8, 145, 178, 0.13); color: #a5f3fc; font-size: 0.74rem; font-weight: 700; }
	.mode-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
	.mode-tabs button, .preset-list button, .prompt-tools button, .canvas-actions button, .mini-button, .seed-row button, .danger-button, .ghost-button, .primary-button { border: 1px solid rgba(148, 163, 184, 0.22); border-radius: 16px; background: rgba(15, 23, 42, 0.7); color: #e2e8f0; font-weight: 750; cursor: pointer; transition: 160ms ease; }
	.mode-tabs button { padding: 12px; text-align: left; }
	.mode-tabs span, .toggle-list small, .queue-item small, .stats-grid span, .card-body p { display: block; color: #94a3b8; font-size: 0.75rem; }
	.mode-tabs button:hover, .mode-tabs button.active, .palette-picker button.active, .image-card.selected { border-color: rgba(103, 232, 249, 0.68); box-shadow: 0 0 0 3px rgba(103, 232, 249, 0.13); }
	.field-stack { display: grid; gap: 8px; color: #cbd5e1; font-weight: 750; }
	.field-stack textarea, .field-stack input, .field-stack select { width: 100%; border: 1px solid rgba(148, 163, 184, 0.18); border-radius: 18px; background: rgba(2, 6, 23, 0.58); padding: 13px 14px; color: #f8fafc; outline: none; }
	.field-stack textarea:focus, .field-stack input:focus, .field-stack select:focus { border-color: rgba(103, 232, 249, 0.68); }
	.compact span, .palette-picker > span, .preset-list > span, .rail-title span { font-size: 0.78rem; color: #94a3b8; }
	.prompt-tools { align-items: center; }
	.prompt-tools button, .canvas-actions button, .mini-button, .seed-row button, .danger-button, .ghost-button, .primary-button { padding: 10px 14px; }
	.prompt-tools span { margin-left: auto; color: #a7f3d0; font-size: 0.76rem; font-weight: 800; }
	.primary-button { border-color: transparent; background: linear-gradient(135deg, #8b5cf6, #06b6d4); color: white; box-shadow: 0 16px 30px rgba(6, 182, 212, 0.18); }
	.primary-button.small { padding-inline: 18px; }
	button:disabled { cursor: not-allowed; opacity: 0.55; }
	.settings-grid, .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
	.slider-stack { display: grid; gap: 12px; }
	.slider-stack label { display: grid; grid-template-columns: 1fr auto; gap: 8px; color: #cbd5e1; font-size: 0.84rem; font-weight: 750; }
	.slider-stack input { grid-column: 1 / -1; accent-color: #22d3ee; }
	.reference-dropzone input { display: none; }
	.reference-dropzone label { display: grid; place-items: center; min-height: 132px; border: 1px dashed rgba(103, 232, 249, 0.38); border-radius: 22px; background: rgba(8, 47, 73, 0.25); text-align: center; cursor: pointer; overflow: hidden; }
	.reference-dropzone img { width: 100%; height: 170px; object-fit: cover; }
	.reference-dropzone span { font-size: 2rem; color: #67e8f9; }
	.reference-dropzone small { color: #94a3b8; }
	.reference-dropzone button { margin-top: 10px; color: #fecaca; }
	.preview-panel { display: grid; gap: 18px; }
	.preview-stage { padding: 20px; }
	.toolbar-meta { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
	.canvas-wrap { position: relative; display: grid; place-items: center; aspect-ratio: 16 / 10; margin: 18px 0; border-radius: 30px; overflow: hidden; isolation: isolate; }
	.canvas-wrap::before { content: ""; position: absolute; inset: 1px; border-radius: inherit; background: rgba(2, 6, 23, 0.34); z-index: -1; }
	.canvas-wrap img { width: min(82%, 720px); max-height: 88%; object-fit: contain; border-radius: 24px; box-shadow: 0 30px 70px rgba(0, 0, 0, 0.36); }
	.empty-canvas { color: #e2e8f0; font-weight: 800; }
	.canvas-badge { position: absolute; left: 18px; bottom: 18px; border-radius: 999px; padding: 9px 12px; background: rgba(2, 6, 23, 0.7); font-size: 0.78rem; font-weight: 800; }
	.gallery-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
	.image-card { border: 1px solid rgba(148, 163, 184, 0.16); border-radius: 22px; background: rgba(15, 23, 42, 0.68); overflow: hidden; }
	.thumb { position: relative; display: block; width: 100%; border: 0; padding: 0; background: transparent; cursor: pointer; }
	.thumb img { width: 100%; aspect-ratio: 1; object-fit: cover; }
	.thumb span { position: absolute; right: 8px; bottom: 8px; border-radius: 999px; padding: 5px 7px; background: rgba(2, 6, 23, 0.72); color: white; font-size: 0.66rem; }
	.card-body { display: grid; gap: 8px; padding: 12px; }
	.card-body div { display: flex; gap: 6px; flex-wrap: wrap; }
	.card-body button, .reference-dropzone button, .rail-title button { border: 0; background: transparent; color: #67e8f9; font-weight: 800; cursor: pointer; }
	.palette-picker, .preset-list, .queue-list, .toggle-list { display: grid; gap: 10px; }
	.palette-picker div { display: flex; gap: 10px; }
	.palette-picker button { width: 46px; height: 34px; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 12px; cursor: pointer; }
	.toggle-list label { display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid rgba(148, 163, 184, 0.14); border-radius: 18px; padding: 12px; background: rgba(2, 6, 23, 0.34); }
	.toggle-list input { width: 42px; height: 24px; accent-color: #22d3ee; }
	.seed-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
	.preset-list button { padding: 11px 12px; text-align: left; }
	.queue-item { display: grid; gap: 8px; border-radius: 18px; padding: 12px; background: rgba(2, 6, 23, 0.34); }
	.queue-item progress { width: 100%; height: 8px; accent-color: #22d3ee; }
	.stats-grid div { border-radius: 18px; padding: 13px; background: rgba(103, 232, 249, 0.08); }
	.stats-grid strong { display: block; font-size: 1.2rem; }
	.danger-button { color: #fecaca; border-color: rgba(248, 113, 113, 0.25); background: rgba(127, 29, 29, 0.24); }
	@media (max-width: 1320px) { .workspace-grid { grid-template-columns: minmax(300px, 360px) minmax(0, 1fr); } .right-rail { position: static; grid-column: 1 / -1; grid-template-columns: repeat(3, minmax(0, 1fr)); } .right-rail .panel-heading, .right-rail .danger-button { grid-column: 1 / -1; } }
	@media (max-width: 980px) { .studio-shell { padding: 14px; } .hero-panel, .workspace-grid, .right-rail { grid-template-columns: 1fr; } .hero-panel { align-items: flex-start; flex-direction: column; } .control-panel, .right-rail { position: static; } .gallery-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	@media (max-width: 620px) { h1 { font-size: 2.4rem; } .panel-card, .hero-panel { border-radius: 22px; padding: 14px; } .mode-tabs, .settings-grid, .stats-grid, .gallery-grid { grid-template-columns: 1fr; } .canvas-wrap { aspect-ratio: 1; } .canvas-actions > *, .hero-actions > *, .prompt-tools > * { flex: 1 1 auto; } }
</style>
