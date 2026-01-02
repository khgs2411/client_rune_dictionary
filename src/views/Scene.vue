<template>
	<div class="scene-container">
		<!-- Loading Screen -->
		<LoadingScreen>></LoadingScreen>

		<!-- Editor Panel (shows when editor mode is enabled) -->
		<EditorPanel v-if="auth.isAuthenticated" />

		<!-- Game Canvas (Interactions now rendered in Three.js!) -->
		<canvas ref="canvasRef" class="three-canvas"></canvas>
	</div>
</template>

<script setup lang="ts">
import EditorPanel from "@/components/EditorPanel.vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import { I_GameScene, I_SceneConfig } from "@/game/common/scenes.types";
import { Engine } from "@/game/Engine";
import { SpriteSheetRegistry } from "@/game/SpriteSheetRegistry";
import { PlaygroundScene } from "@/scenes/PlaygroundScene";
import { useAuthStore } from "@/stores/auth.store";
import { useSceneStore } from "@/stores/scene.store";
import { tryOnMounted, tryOnUnmounted, useRafFn, useWindowSize } from "@vueuse/core";
import { ref, watch } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const auth = useAuthStore();
const scenes = useSceneStore();

let engine: Engine | null = null;
let currentScene: I_GameScene | null = null;

// VueUse: Auto-reactive window size
const { width, height } = useWindowSize();

function start() {
	try {
		if (!canvasRef.value) return;

		// Prevent double initialization
		if (engine || currentScene) {
			console.warn("⚠️ [Game] Already initialized, skipping...");
			return;
		}

		console.log("🎮 [Game] Initializing game...");

		// Create engine
		engine = new Engine(canvasRef.value);
		console.log("   ↳ Scene UUID:", engine.scene.uuid);

		loadSceneAssets();
		
		// Create and load playground scene
		// LoadingScreen.vue (mounted first) listens to events emitted by the scene
		setCurrentScene();

		// Start render loop
		resumeRenderLoop();
	} catch (error) {
		console.error("❌ [Game] Error during initialization:", error);
	}
}

function render() {
	if (!engine || !currentScene) return;

	const delta = engine.clock.getDelta();

	// Update scene
	currentScene.update(delta);

	// Render
	engine.render(currentScene.camera.instance);
}

async function destroy() {
	console.log("🧹 [Game] Starting cleanup...");

	// Pause render loop
	console.log("   ↳ Pausing render loop...");
	pauseRenderLoop();

	// Cleanup playground scene (await to ensure physics is fully cleaned up)
	await cleanupGame();

	console.log("✅ [Game] Cleanup complete");
}

async function cleanupGame() {
	if (currentScene) {
		console.log("   ↳ Destroying scene...");
		await currentScene.destroy(); // Wait for physics cleanup!
		currentScene = null;
	}

	// Cleanup engine
	if (engine) {
		console.log("   ↳ Cleaning up engine...");
		engine.cleanup();
		engine = null;
	}
}

function loadSceneAssets() {
	SpriteSheetRegistry.RegisterAllSpriteSheets();
}

function setCurrentScene() {
	if (!engine) return;
	const activeScene = scenes.getActiveScene();
	if (!activeScene) {
		throw new Error("No active scene set in store");
	}
	if (activeScene === "PlaygroundScene") {
		const config: I_SceneConfig = { engine };
		currentScene = new PlaygroundScene(config);
	}
}

function tryOnReload(cb: Function) {
	if (import.meta.hot) {
		import.meta.hot.dispose(() => {
			console.log("🔥 [Game] Hot Module Replacement detected");
			cb();
		});
	}
}

// VueUse: Animation frame loop
const { pause: pauseRenderLoop, resume: resumeRenderLoop } = useRafFn(render, {
	// Don't start immediately
	immediate: false,
	fpsLimit: undefined,
});

// Watch window size changes and resize engine
watch([width, height], () => {
	if (engine) {
		engine.resize();
	}
});

// VueUse: Safe lifecycle hooks
tryOnMounted(start);
tryOnUnmounted(destroy);
// Handle hot module replacement (HMR) cleanup
tryOnReload(destroy);
</script>

<style scoped>
.scene-container {
	width: 100%;
	height: 100%;
	position: relative;
}

.three-canvas {
	width: 100%;
	height: 100%;
	display: block;
	outline: none;
}
</style>
