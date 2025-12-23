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
import { CollisionComponent } from "@/game/components/interactions/CollisionComponent";
import { DragComponent } from "@/game/components/interactions/DragComponent";
import { HoverGlowComponent } from "@/game/components/interactions/HoverGlowComponent";
import { MatchComponent } from "@/game/components/match/MatchComponent";
import { BillboardComponent } from "@/game/components/rendering/BillboardComponent";
import { GeometryComponent } from "@/game/components/rendering/GeometryComponent";
import { InstancedMeshComponent } from "@/game/components/rendering/InstancedMeshComponent";
import { MaterialComponent } from "@/game/components/rendering/MaterialComponent";
import { MeshComponent } from "@/game/components/rendering/MeshComponent";
import { SpriteComponent } from "@/game/components/rendering/SpriteComponent";
import { MultiplayerModule } from "@/game/modules/networking/MultiplayerModule";
import { Fireball } from "@/game/prefabs/Fireball";
import { Ground } from "@/game/prefabs/Ground";
import { Trees } from "@/game/prefabs/Trees";
import { LocalPlayer } from "@/game/prefabs/character/LocalPlayer";
import { House } from "@/game/prefabs/environment/House";
import { Path } from "@/game/prefabs/environment/Path";
import { Rocks } from "@/game/prefabs/environment/Rock";
import { TrainingDummy } from "@/game/prefabs/npc/TrainingDummy";
import { SpriteCharacter } from "@/game/prefabs/SpriteCharacter";

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
		const ground = new Ground({ size: 200, showGrid: false });
		const gom = this.getService("gameObjectsManager");
		gom.register(ground);

		// Add environment objects
		this.addEnvironmentObjects();

		// Training Dummy NPC (for match creation testing) - uses goblin sprite
		const trainingDummy = new TrainingDummy({
			id: "training-dummy-1",
			type: "npc",
			position: [-5, 0, 5], // Ground level for sprite
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

		// ========================================
		// INTERACTIVE TEST OBJECT
		// ========================================
		const interactiveBox = new GameObject({ id: "interactive-box" })
			.addComponent(new TransformComponent({ position: [5, 1, 5] }))
			.addComponent(new GeometryComponent({ type: "box", params: { x: 3, y: 2, z: 1.5 } }))
			.addComponent(new MaterialComponent({ color: 0xff1493, roughness: 0.8, metalness: 0.2 }))
			.addComponent(new MeshComponent())
			.addComponent(
				new CollisionComponent({
					type: "static",
					shape: "cuboid",
					showDebug: true,
				}),
			)
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

		// ========================================
		// SMALL TOWN (Toon Shading + Vibrant)
		// ========================================

		// Town center house
		const [townHouseWalls, townHouseRoof] = House.create({
			id: "town-house-1",
			position: [30, 0, 0],
			useToonShading: true,
			vibrant: true,
			wallColor: 0xf5deb3, // Wheat
			roofColor: 0x8b0000, // Dark red
		});
		gom.register(townHouseWalls);
		gom.register(townHouseRoof);

		// Second house
		const [house2Walls, house2Roof] = House.create({
			id: "town-house-2",
			position: [45, 0, -10],
			rotation: [0, Math.PI / 6, 0],
			useToonShading: true,
			vibrant: true,
			wallColor: 0xffe4c4, // Bisque
			roofColor: 0x2f4f4f, // Dark slate gray
		});
		gom.register(house2Walls);
		gom.register(house2Roof);

		// Third house
		const [house3Walls, house3Roof] = House.create({
			id: "town-house-3",
			position: [50, 0, 15],
			rotation: [0, -Math.PI / 4, 0],
			scale: 0.8,
			useToonShading: true,
			vibrant: true,
			wallColor: 0xfaebd7, // Antique white
			roofColor: 0x556b2f, // Dark olive green
		});
		gom.register(house3Walls);
		gom.register(house3Roof);

		// Town paths
		const townPaths = Path.createStraight({
			id: "town-main-path",
			start: [0, 0],
			end: [30, 0],
			width: 5,
			useToonShading: true,
			color: 0xd2b48c, // Tan
		});
		townPaths.forEach((segment) => gom.register(segment));

		// Path to second house
		const path2 = Path.createStraight({
			id: "town-house2-path",
			start: [30, 0],
			end: [45, -10],
			width: 4,
			useToonShading: true,
			color: 0xd2b48c,
		});
		path2.forEach((segment) => gom.register(segment));

		// ========================================
		// FOREST (Toon Shading + Vibrant)
		// ========================================

		// Dense forest area (negative X side)
		const [forestTrunks, forestLeaves] = Trees.create({
			id: "forest-trees",
			positions: [
				// Forest cluster 1
				{ x: -25, y: 0, z: 10 },
				{ x: -30, y: 0, z: 8 },
				{ x: -28, y: 0, z: 15 },
				{ x: -35, y: 0, z: 12 },
				{ x: -32, y: 0, z: 5 },
			],
			useToonShading: true,
			vibrant: true,
			leavesColor: 0x228b22, // Forest green
			trunkColor: 0x8b4513, // Saddle brown
		});
		gom.register(forestTrunks);
		gom.register(forestLeaves);
		const [forestTrunks2, forestLeaves2] = Trees.create({
			id: "forest-trees-2",
			positions: [
				// Forest cluster 2
				{ x: -40, y: 0, z: -5 },
				{ x: -45, y: 0, z: -8 },
				{ x: -42, y: 0, z: 0 },
				{ x: -38, y: 0, z: -12 },
				{ x: -50, y: 0, z: -3 },
			],
			useToonShading: true,
			vibrant: true,
			leavesColor: 0x228b22, // Forest green
			trunkColor: 0x8b4513, // Saddle brown
		});
		gom.register(forestTrunks2);
		gom.register(forestLeaves2);
		const [forestTrunks3, forestLeaves3] = Trees.create({
			id: "forest-trees-3",
			positions: [
				// Scattered trees
				{ x: -20, y: 0, z: -15 },
				{ x: -55, y: 0, z: 10 },
				{ x: -48, y: 0, z: 18 },
			],
			useToonShading: true,
			vibrant: true,
			leavesColor: 0x228b22, // Forest green
			trunkColor: 0x8b4513, // Saddle brown
		});
		gom.register(forestTrunks3);
		gom.register(forestLeaves3);

		// Trees near town (sparser)
		const [townTrunks, townLeaves] = Trees.create({
			id: "town-trees",
			positions: [
				{ x: 20, y: 0, z: 20 },
				{ x: 55, y: 0, z: 25 },
				{ x: 60, y: 0, z: -5 },
				{ x: 25, y: 0, z: -20 },
			],
			useToonShading: true,
			vibrant: true,
			leavesColor: 0x32cd32, // Lime green (variety)
		});
		gom.register(townTrunks);
		gom.register(townLeaves);

		// ========================================
		// ROCKS (scattered around)
		// ========================================

		const rocks = new Rocks({
			positions: [
				// Near forest
				{ x: -22, y: 0, z: 5, scale: 1.2 },
				{ x: -35, y: 0, z: -15, scale: 0.8 },
				{ x: -48, y: 0, z: 8, scale: 1.5 },
				// Near town
				{ x: 35, y: 0, z: 10, scale: 0.6 },
				{ x: 52, y: 0, z: -15, scale: 1.0 },
				// Random scatter
				{ x: 10, y: 0, z: -25, scale: 0.9 },
				{ x: -10, y: 0, z: 25, scale: 1.1 },
			],
			useToonShading: true,
			vibrant: true,
			color: 0x696969, // Dim gray
		});
		gom.register(rocks);

		// ========================================
		// BUSHES (using instanced mesh)
		// ========================================
		const bushes = new GameObject({ id: "bushes" })
			.addComponent(new GeometryComponent({ type: "sphere", params: [1.5, 6, 6] }))
			.addComponent(new MaterialComponent({ color: 0x228b22, roughness: 1.0 }))
			.addComponent(
				new InstancedMeshComponent({
					instances: [
						// Near forest
						{ position: [-26, 0.8, 6] },
						{ position: [-33, 0.8, 10] },
						{ position: [-41, 0.8, -2] },
						// Near town
						{ position: [28, 0.8, 5] },
						{ position: [48, 0.8, -8] },
						{ position: [38, 0.8, 18] },
						// Near spawn
						{ position: [8, 0.8, 8] },
						{ position: [-5, 0.8, -8] },
					],
				}),
			);
		gom.register(bushes);

		// ========================================
		// BILLBOARD SPRITES
		// ========================================

		// Sprite Trees (cylindrical billboarding - stay upright)
		const spriteTrees = [
			{ id: "sprite-tree-0", position: [15, 0, 15] as [number, number, number], texture: "/sprites/tree_00.png", size: [4, 5] as [number, number] },
			{ id: "sprite-tree-1", position: [18, 0, 12] as [number, number, number], texture: "/sprites/tree_01.png", size: [3.5, 4.5] as [number, number] },
			{ id: "sprite-tree-2", position: [12, 0, 18] as [number, number, number], texture: "/sprites/tree_02.png", size: [3, 4] as [number, number] },
			{ id: "sprite-tree-3", position: [20, 0, 20] as [number, number, number], texture: "/sprites/tree_03.png", size: [2.5, 3.5] as [number, number] },
		];

		for (const tree of spriteTrees) {
			const spriteTree = new SpriteCharacter({
				id: tree.id,
				position: tree.position,
				texture: tree.texture,
				size: tree.size,
				billboardMode: "cylindrical",
			});
			gom.register(spriteTree);
		}

		// Sprite NPC - Knight
		const spriteKnight = new SpriteCharacter({
			id: "sprite-knight",
			position: [-8, 0, 8],
			texture: "/sprites/knight_00.png",
			size: [1.5, 2],
			billboardMode: "cylindrical",
		});
		gom.register(spriteKnight);

		// Sprite NPC - Goblin
		const spriteGoblin = new SpriteCharacter({
			id: "sprite-goblin",
			position: [-12, 0, 5],
			texture: "/sprites/goblin_00.png",
			size: [1.2, 1.5],
			billboardMode: "cylindrical",
		});
		gom.register(spriteGoblin);

		// Sprite NPC - Mage (standalone GameObject without prefab - demonstrates raw component usage)
		const standaloneMage = new GameObject({ id: "standalone-mage" })
			.addComponent(new TransformComponent({ position: [-10, 0, 12] }))
			.addComponent(
				new SpriteComponent({
					texture: "/sprites/mage_00.png",
					size: [1.5, 2],
					anchor: [0.5, 0], // Bottom-center for standing character
				}),
			)
			.addComponent(
				new BillboardComponent({
					mode: "cylindrical",
				}),
			);
		gom.register(standaloneMage);

		// Sprite Buildings
		const spriteHouse = new SpriteCharacter({
			id: "sprite-house",
			position: [25, 0, -10],
			texture: "/sprites/house_00.png",
			size: [6, 5],
			billboardMode: "cylindrical",
		});
		gom.register(spriteHouse);

		const spriteShop = new SpriteCharacter({
			id: "sprite-shop",
			position: [30, 0, -5],
			texture: "/sprites/shop_01.png",
			size: [5, 4.5],
			billboardMode: "cylindrical",
		});
		gom.register(spriteShop);
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
