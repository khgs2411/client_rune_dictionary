import { I_ThemeColors } from "@/composables/useTheme";
import type { Engine } from "@/game/Engine";
import { GameScene } from "@/game/GameScene";
import { DebugModule } from "@/game/modules/scene/DebugModule";
import { LightingModule } from "@/game/modules/scene/LightingModule";
import { MatchModule } from "@/game/modules/scene/MatchModule";
import { watch } from "vue";
import { I_SceneConfig } from "../game/common/scenes.types";

import { GameObject } from "@/game/GameObject";
import { TransformComponent } from "@/game/components/entities/TransformComponent";
import { ClickVFXComponent } from "@/game/components/interactions/ClickVFXComponent";
import { CollisionComponent } from "@/game/components/physics/CollisionComponent";
import { DragComponent } from "@/game/components/interactions/DragComponent";
import { HoverComponent } from "@/game/components/interactions/HoverComponent";
import { HoverGlowComponent } from "@/game/components/interactions/HoverGlowComponent";
import { MatchComponent } from "@/game/components/match/MatchComponent";
import { GeometryComponent } from "@/game/components/rendering/GeometryComponent";
import { MaterialComponent } from "@/game/components/rendering/MaterialComponent";
import { MeshComponent } from "@/game/components/rendering/MeshComponent";
import { MultiplayerModule } from "@/game/modules/networking/MultiplayerModule";
import { Fireball } from "@/game/prefabs/Fireball";
import { Ground } from "@/game/prefabs/Ground";
import { Trees } from "@/game/prefabs/Trees";
import { LocalPlayer } from "@/game/prefabs/character/LocalPlayer";
import { House } from "@/game/prefabs/environment/House";
import { Path } from "@/game/prefabs/environment/Path";
import { Rocks } from "@/game/prefabs/environment/Rock";
import { TrainingDummy } from "@/game/prefabs/npc/TrainingDummy";
import { SpriteGameObject } from "@/game/prefabs/SpriteGameObject";

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
	lighting: LightingModule;
	debug: DebugModule;
	match: MatchModule;
}

export class PlaygroundScene extends GameScene<PlaygroundModuleRegistry> {
	readonly name = "PlaygroundScene";
	readonly engine: Engine;

	constructor(config: I_SceneConfig) {
		super();
		this.engine = config.engine;
		this.start();
	}

	/**
	 * Register scene-specific modules
	 */
	protected registerModules(): void {
		this.addModule("lighting", new LightingModule());
		this.addModule("multiplayer", new MultiplayerModule());
		this.addModule("match", new MatchModule());
	}

	protected addSceneObjects() {
		// Ground
		const ground = new Ground({ size: 200, showGrid: true });
		const gom = this.getService("gameObjectsManager");
		gom.register(ground);

		// Add environment objects
		this.addEnvironmentObjects();

		// Training Dummy NPC (for match creation testing) - near the shop in town
		const trainingDummy = new TrainingDummy({
			id: "training-dummy-1",
			type: "npc",
			position: [5, 0, 10], // Near the shop, inside town
		});
		gom.register(trainingDummy);

		// ========================================
		// SPAWN SYSTEM DEMO
		// ========================================

		// Get spawner service
		const spawner = this.getService("spawner");

		// 1. PREFAB APPROACH - Register Fireball factory
		spawner.registerFactory(
			"fireball",
			(id, config) => {
				return new Fireball({ id, ...config });
			},
			{
				poolSize: 10, // Max 10 fireballs globally
				maxActivePerOwner: 5, // Max 5 per player
			},
		);

		// 2. MANUAL APPROACH - Register custom spawnable (non-prefab)
		spawner.registerFactory(
			"ice-shard",
			(id, config) => {
				const iceShard = new GameObject({ id })
					.addComponent(
						new TransformComponent({
							position: config.position || [0, 1, 0],
						}),
					)
					.addComponent(
						new GeometryComponent({
							type: "cone",
							params: [0.2, 0.8, 8], // Sharp cone for ice shard
						}),
					)
					.addComponent(
						new MaterialComponent({
							color: 0x00bfff, // Deep sky blue
							emissive: 0x00bfff,
							emissiveIntensity: 0.3,
							roughness: 0.2,
							metalness: 0.8,
						}),
					)
					.addComponent(new MeshComponent());

				// TODO: Add TrajectoryComponent and CollisionComponent once implemented

				return iceShard;
			},
			{
				poolSize: 20, // Max 20 ice shards globally
				maxActivePerOwner: 10, // Max 10 per player
			},
		);

		// Create LocalPlayer GameObject (replaces CharacterModule)
		// Don't pass position config - let LocalPlayer read directly from controller
		const localPlayer = new LocalPlayer({
			playerId: "local-player",
			characterController: this.character.controller,
		});

		// Register player AFTER all components are added
		gom.register(localPlayer);
	}

	protected onSceneLoaded(): void {
		// Auto-match debug feature (simulates double-click on TrainingDummy)
		const trainingDummy = this.getService("gameObjectsManager").get<TrainingDummy>("training-dummy-1");
		if (!trainingDummy) return;
		this.handleAutoMatch(trainingDummy);
	}

	private addEnvironmentObjects() {
		const gom = this.getService("gameObjectsManager");

		this.addTownCenter(gom);
		this.addTownPaths(gom);
		this.addTownNPCs(gom);
		this.addOutskirts(gom);
		this.addForestPerimeter(gom);
		this.addSlimeZone(gom);
		this.addDebugObjects(gom);
	}

	private addTownCenter(gom: ReturnType<typeof this.getService<"gameObjectsManager">>): void {
		// Central shop - slightly larger, prominent position
		const shops = House.create({
			id: "town-shop",
			positions: [{ x: 0, y: 0, z: 12, spriteSheetId: "shop-01", scale: 1.15 }],
		});
		shops.forEach((s) => gom.register(s));

		// Residential houses clustered around the shop
		const houses = House.create({
			id: "town-houses",
			positions: [
				{ x: -10, y: 0, z: 8 }, // West side
				{ x: 10, y: 0, z: 8 }, // East side
				{ x: -14, y: 0, z: 16, scale: 0.9 }, // Northwest
				{ x: 14, y: 0, z: 16, scale: 0.9 }, // Northeast
			],
			cycleTextures: false, // All use house-00
		});
		houses.forEach((h) => gom.register(h));
	}

	private addTownPaths(gom: ReturnType<typeof this.getService<"gameObjectsManager">>): void {
		// Main entrance path (south to town center)
		const entrancePath = Path.createStraight({
			id: "path-entrance",
			start: [0, -20],
			end: [0, 8],
			width: 4,
			useToonShading: true,
			color: 0xc4a574,
		});
		entrancePath.forEach((p) => gom.register(p));

		// East-west cross path through town
		const crossPathWest = Path.createStraight({
			id: "path-cross-west",
			start: [-12, 8],
			end: [0, 8],
			width: 3,
			useToonShading: true,
			color: 0xc4a574,
		});
		crossPathWest.forEach((p) => gom.register(p));

		const crossPathEast = Path.createStraight({
			id: "path-cross-east",
			start: [0, 8],
			end: [12, 8],
			width: 3,
			useToonShading: true,
			color: 0xc4a574,
		});
		crossPathEast.forEach((p) => gom.register(p));
	}

	private addTownNPCs(gom: ReturnType<typeof this.getService<"gameObjectsManager">>): void {
		// Knight guard at town entrance
		const guard = new SpriteGameObject({
			id: "npc-guard",
			position: [3, 0, -5],
			texture: "/sprites/knight_00.png",
			size: [1.5, 2],
			billboardMode: "cylindrical",
		});
		gom.register(guard);

		// Mage near the shop (in front of it)
		const mage = new SpriteGameObject({
			id: "npc-mage",
			position: [-2, 0, -6],
			texture: "/sprites/mage_00.png",
			size: [1.5, 2],
			billboardMode: "cylindrical",
		});
		gom.register(mage);

		// Goblin on east side of town (moved forward)
		const goblin = new SpriteGameObject({
			id: "npc-goblin",
			position: [8, 0, 2],
			texture: "/sprites/goblin_00.png",
			size: [1.2, 1.5],
			billboardMode: "cylindrical",
		});
		gom.register(goblin);
	}

	private addOutskirts(gom: ReturnType<typeof this.getService<"gameObjectsManager">>): void {
		// Scattered trees near town (not blocking paths)
		const outskirtsTree = Trees.create({
			id: "outskirts-trees",
			positions: [
				// Original 6
				{ x: 18, y: 0, z: 3 },
				{ x: -18, y: 0, z: 5 },
				{ x: 20, y: 0, z: 18 },
				{ x: -20, y: 0, z: 20 },
				{ x: 15, y: 0, z: -8 },
				{ x: -16, y: 0, z: -6 },
				// Additional 6
				{ x: 24, y: 0, z: -3 },
				{ x: -22, y: 0, z: -10 },
				{ x: 26, y: 0, z: 12 },
				{ x: -26, y: 0, z: 15 },
				{ x: 22, y: 0, z: 22 },
				{ x: -24, y: 0, z: 24 },
			],
			cycleTextures: true,
		});
		outskirtsTree.forEach((t) => gom.register(t));

		// Rocks scattered around
		const rocks = Rocks.create({
			id: "outskirts-rocks",
			positions: [
				{ x: 22, y: 0, z: 10, scale: 0.8 },
				{ x: -24, y: 0, z: 12, scale: 1.2 },
				{ x: 12, y: 0, z: -12, scale: 0.7 },
				{ x: -10, y: 0, z: -15, scale: 1.0 },
				{ x: 25, y: 0, z: -5, scale: 0.9 },
			],
			cycleTextures: true,
		});
		rocks.forEach((r) => gom.register(r));
	}

	private addForestPerimeter(gom: ReturnType<typeof this.getService<"gameObjectsManager">>): void {
		const FOREST_CONFIG = {
			outerRadius: 45,
			outerCount: 50,
			innerRadius: 35,
			innerCount: 20,
			radiusVariation: 6,
			outerGapRadians: 0.35, // ~20° each side of south
			innerGapRadians: 0.5, // Wider gap for inner ring
		};

		const forestPositions: Array<{ x: number; y: number; z: number }> = [];
		const southAngle = -Math.PI / 2; // -90° points to -Z (south)

		// Outer ring
		for (let i = 0; i < FOREST_CONFIG.outerCount; i++) {
			const angle = (i / FOREST_CONFIG.outerCount) * Math.PI * 2;

			// Calculate angular distance from south
			const angleDiff = Math.abs(Math.atan2(Math.sin(angle - southAngle), Math.cos(angle - southAngle)));

			// Skip trees in entrance gap
			if (angleDiff < FOREST_CONFIG.outerGapRadians) continue;

			// Randomize radius for organic look
			const radius = FOREST_CONFIG.outerRadius + (Math.random() - 0.5) * FOREST_CONFIG.radiusVariation * 2;

			forestPositions.push({
				x: Math.cos(angle) * radius,
				y: 0,
				z: Math.sin(angle) * radius,
			});
		}

		// Inner ring (wider gap for clear path)
		for (let i = 0; i < FOREST_CONFIG.innerCount; i++) {
			const angle = (i / FOREST_CONFIG.innerCount) * Math.PI * 2;

			const angleDiff = Math.abs(Math.atan2(Math.sin(angle - southAngle), Math.cos(angle - southAngle)));

			if (angleDiff < FOREST_CONFIG.innerGapRadians) continue;

			const radius = FOREST_CONFIG.innerRadius + (Math.random() - 0.5) * FOREST_CONFIG.radiusVariation * 2;

			forestPositions.push({
				x: Math.cos(angle) * radius,
				y: 0,
				z: Math.sin(angle) * radius,
			});
		}

		const forest = Trees.create({
			id: "forest-perimeter",
			positions: forestPositions,
			cycleTextures: true,
		});
		forest.forEach((t) => gom.register(t));
	}

	private addSlimeZone(gom: ReturnType<typeof this.getService<"gameObjectsManager">>): void {
		// Slime positions - clustered near entrance but outside town
		const slimeConfigs = [
			{ id: "slime-1", position: [-6, 0, -20] as [number, number, number] },
			{ id: "slime-2", position: [5, 0, -23] as [number, number, number] },
			{ id: "slime-3", position: [-2, 0, -26] as [number, number, number] },
			{ id: "slime-4", position: [9, 0, -19] as [number, number, number] },
			{ id: "slime-5", position: [-10, 0, -24] as [number, number, number] },
		];

		slimeConfigs.forEach((config) => {
			const slime = new TrainingDummy({
				id: config.id,
				type: "npc",
				position: config.position,
			});
			gom.register(slime);
		});
	}

	private addDebugObjects(gom: ReturnType<typeof this.getService<"gameObjectsManager">>): void {
		// Interactive test box - relocated to northeast edge of town
		const interactiveBox = new GameObject({ id: "interactive-box" })
			.addComponent(new TransformComponent({ position: [35, 1, 25] }))
			.addComponent(new GeometryComponent({ type: "box", params: { x: 3, y: 2, z: 1.5 } }))
			.addComponent(new MaterialComponent({ color: 0xff1493, roughness: 0.8, metalness: 0.2 }))
			.addComponent(new MeshComponent())
			.addComponent(
				new CollisionComponent({
					type: "static",
				}),
			)
			.addComponent(new HoverComponent())
			.addComponent(
				new HoverGlowComponent({
					glowColor: 0xff8c00,
					glowIntensity: 0.5,
					tooltip: { title: "Interactive Box", description: "Click for VFX, drag in editor mode" },
				}),
			)
			.addComponent(
				new ClickVFXComponent({
					text: "BOOM!",
					textColor: "#FF69B4",
					cameraShake: { intensity: 0.2, duration: 0.5 },
					particles: { count: 30, color: 0xff1493, speed: 4 },
				}),
			)
			.addComponent(
				new DragComponent({
					lockAxis: ["y"],
					onDragEnd: (pos) => console.log("✅ Interactive box dragged to:", pos),
				}),
			);

		gom.register(interactiveBox);
	}

	/**
	 * Add scene-specific setup (theme watchers)
	 */
	protected finalizeSetup(): void {
		super.finalizeSetup();
		this.setWatchers();
	}

	private setWatchers(): void {
		// Watch for theme changes (color theme: neutral, rose, blue, etc.)
		this.cleanupRegistry.registerWatcher(
			watch(
				() => this.settings.theme.currentTheme,
				() => {
					console.log("🎨 [PlaygroundScene] Theme changed, updating colors...");
					this.updateMaterialColors();
				},
			),
		);

		this.cleanupRegistry.registerWatcher(
			watch(
				() => this.settings.theme.colorMode,
				() => {
					console.log("🌗 [PlaygroundScene] Dark mode toggled, updating colors...");
					this.updateMaterialColors();
				},
			),
		);
	}

	private updateMaterialColors(): void {
		// Build theme colors object from settings
		const theme: I_ThemeColors = {
			primary: this.settings.theme.primary,
			primaryForeground: this.settings.theme.primaryForeground,
			accent: this.settings.theme.accent,
			accentForeground: this.settings.theme.accentForeground,
			background: this.settings.theme.background,
			foreground: this.settings.theme.foreground,
			muted: this.settings.theme.muted,
			card: this.settings.theme.card,
			border: this.settings.theme.border,
		};

		this.getService("gameObjectsManager").onThemeChange(theme);
	}

	/**
	 * Auto-match debug feature
	 * Automatically starts a PvE match on reload if autoMatch debug flag is enabled
	 * Simulates double-click on TrainingDummy by triggering MatchComponent directly
	 */
	private handleAutoMatch(trainingDummy: TrainingDummy): void {
		// Check if auto-match is enabled
		if (!this.settings.debug.autoMatch) {
			return; // Auto-match disabled, do nothing
		}

		console.log("🎮 [PlaygroundScene] Auto-match enabled, starting PvE match in 1 second...");

		// Wait 1 second for scene to fully initialize, then trigger match
		setTimeout(async () => {
			// Get MatchComponent from TrainingDummy
			const matchComponent = trainingDummy.getComponent(MatchComponent);

			if (!matchComponent) {
				console.error("🎮 [PlaygroundScene] Auto-match failed: MatchComponent not found on TrainingDummy");
				return;
			}

			console.log("🎮 [PlaygroundScene] Triggering match creation via MatchComponent...");

			// Call the private method using type assertion (hacky but works for debug feature)
			// @ts-ignore - Accessing private method for debug purposes
			await matchComponent.handleMatchCreation(this.getSceneContext());

			console.log("🎮 [PlaygroundScene] Auto-match triggered successfully");
		}, 1000);
	}
}
