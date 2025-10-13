import { I_ThemeColors } from '@/composables/useTheme';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { CharacterModule } from '@/game/modules/scene/CharacterModule';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { SceneInstancedObjectsModule } from '@/game/modules/scene/SceneInstancedObjectsModule';
import { SceneObjectsModule } from '@/game/modules/scene/SceneObjectsModule';
import { watch } from 'vue';
import { I_SceneConfig } from './scenes.types';
import { Vector3 } from 'three';
import { Lib } from 'topsyde-utils';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  ground: SceneInstancedObjectsModule;
  instancedSceneObjects: SceneInstancedObjectsModule;
  sceneObjects: SceneObjectsModule;
  treeTrunks: SceneInstancedObjectsModule;
  treeLeaves: SceneInstancedObjectsModule;
  bushes: SceneInstancedObjectsModule;
  debug: DebugModule;
  characterMesh: CharacterModule;
}

export class PlaygroundScene extends GameScene<PlaygroundModuleRegistry> {
  readonly name = 'PlaygroundScene';
  readonly engine: Engine;

  constructor(config: I_SceneConfig) {
    super();
    this.engine = config.engine;
    this.start();
  }

  /**
   * Register scene-specific modules
   * Note: No need to register InteractionSystemModule - it's now a service!
   */
  protected registerModules(): void {
    this.addModule('lighting', new LightingModule());
    this.addModule('ground', new SceneInstancedObjectsModule([{ material: { reactiveColor: 'background' }, geometry: { grid: false, type: 'plane', params: [100, 100] }, position: [0, 0, 0] }]));
    this.addModule('characterMesh', new CharacterModule(this.character.controller));
  }

  protected addSceneObjects() {
    this.addModule(
      'instancedSceneObjects',
      new SceneInstancedObjectsModule([
        {
          position: [5, 1, 0],
          scale: [2, 2, 2],
          geometry: { type: 'box', params: [1, 1, 1] },
          material: { useTheme: true, roughness: 0.8 },
        },
        {
          position: [8, 1, 5],
          scale: [3, 3, 2],
          geometry: { type: 'box', params: [1, 1, 1] },
          material: { useTheme: true, roughness: 0.8 },
        },
        {
          position: [0, 1, -10],
          scale: [4, 1.5, 1.5],
          geometry: { type: 'box', params: [1, 1, 1] },
          material: { staticColor: 0x8b4513, roughness: 0.9 }, // Brown
        },
      ]),
    );

    // Unique interactive object (regular mesh) - use shared modules
    this.addModule(
      'sceneObjects',
      new SceneObjectsModule([
        {
          position: [-3, 1, 3], // Different position - not overlapping with boxes
          geometry: { type: 'box', params: [2, 2, 2] }, // Increased segments for better raycast detection
          material: { staticColor: 0xff00ff, roughness: 0.2, metalness: 0.8 }, // Shiny pink sphere
          interactive: true,
          interaction: {
            // HOVER: Glow + tooltip
            hover: {
              glow: {
                color: 0xff8c00,
                intensity: () => this.config.interaction.hoverGlowIntensity,
              },
              tooltip: {
                title: 'Draggable Box',
                description: 'Enable editor mode to drag me!',
              },
            },

            // CLICK: VFX + shake (disabled in editor mode)
            click: {
              vfx: { text: 'POW!', color: '#ff00ff' },
              shake: {
                intensity: () => this.config.interaction.cameraShakeIntensity,
                duration: 0.5,
              },
            },

            // DRAG: Lock Y axis, snap to grid (only works in editor mode)
            drag: {
              enabled: true,
              lockAxis: ['y'], // Keep at same height
              snapToGrid: this.config.editor.snapToGrid, // Snap to 0.5 unit grid
              customCallbacks: {
                onStart: (pos) => {
                  console.log('🎯 Started dragging box from:', pos);
                },
                onEnd: (pos) => {
                  console.log('✅ Finished dragging box to:', pos);
                  this.storeObjectPosition('sceneObjects', pos);
                },
              },
            },
          },
        },
      ]),
    );

    // Tree trunks (brown cylinders) - instanced for performance (use shared modules)
    this.addModule(
      'treeTrunks',
      new SceneInstancedObjectsModule([
        {
          position: [10, 0.75, 0],
          geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] },
          material: { staticColor: 0x654321 },
        },
        {
          position: [12, 0.75, 2],
          geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] },
          material: { staticColor: 0x654321 },
        },
        {
          position: [14, 0.75, -1],
          geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] },
          material: { staticColor: 0x654321 },
        },
        {
          position: [10, 0.75, -3],
          geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] },
          material: { staticColor: 0x654321 },
        },
        {
          position: [13, 0.75, -2],
          geometry: { type: 'cylinder', params: [0.15, 0.2, 1.5] },
          material: { staticColor: 0x654321 },
        },
      ]),
    );

    // Tree leaves (green cones) - instanced (use shared modules)
    this.addModule(
      'treeLeaves',
      new SceneInstancedObjectsModule([
        {
          position: [10, 2, 0],
          geometry: { type: 'cone', params: [0.8, 1.5, 8] },
          material: { staticColor: 0x228b22, roughness: 0.9 },
        },
        {
          position: [12, 2, 2],
          geometry: { type: 'cone', params: [0.8, 1.5, 8] },
          material: { staticColor: 0x228b22, roughness: 0.9 },
        },
        {
          position: [14, 2, -1],
          geometry: { type: 'cone', params: [0.8, 1.5, 8] },
          material: { staticColor: 0x228b22, roughness: 0.9 },
        },
        {
          position: [10, 2, -3],
          geometry: { type: 'cone', params: [0.8, 1.5, 8] },
          material: { staticColor: 0x228b22, roughness: 0.9 },
        },
        {
          position: [13, 2, -2],
          geometry: { type: 'cone', params: [0.8, 1.5, 8] },
          material: { staticColor: 0x228b22, roughness: 0.9 },
        },
      ]),
    );

    // Bushes (green spheres) - instanced (use shared modules)
    this.addModule(
      'bushes',
      new SceneInstancedObjectsModule([
        {
          position: [8, 0.3, 1],
          geometry: { type: 'sphere', params: [0.4, 8, 8] },
          material: { staticColor: 0x2d5016, roughness: 1.0 },
        },
        {
          position: [11, 0.3, -1],
          geometry: { type: 'sphere', params: [0.4, 8, 8] },
          material: { staticColor: 0x2d5016, roughness: 1.0 },
        },
        {
          position: [15, 0.3, 0],
          geometry: { type: 'sphere', params: [0.4, 8, 8] },
          material: { staticColor: 0x2d5016, roughness: 1.0 },
        },
        {
          position: [9, 0.3, -4],
          geometry: { type: 'sphere', params: [0.4, 8, 8] },
          material: { staticColor: 0x2d5016, roughness: 1.0 },
        },
      ]),
    );

    this.addModule('debug', new DebugModule());
  }

  private storeObjectPosition(objectKey: string, pos: Vector3) {
    // Update physics collider to match new position
    // ID format: scene-object-{moduleId}-{index}
    const module = this.getModule(objectKey);
    if (module) {
      const objectId = `scene-object-${(module as any).id}-0`;

      // Update physics
      if (this.services.physics.isReady()) {
        this.services.physics.updateStaticBodyPosition(objectId, pos);
        console.log(`🔄 Updated physics body: ${objectId}`);
      }

      // Save position to store
      this.store.saveObjectPosition(this.name, objectId, {
        x: pos.x,
        y: pos.y,
        z: pos.z,
      });
    }
  }

  /**
   * Add scene-specific setup (theme watchers)
   */
  protected finalizeSetup(): void {
    super.finalizeSetup();
    this.setLifecycleWatchers();
  }

  private setLifecycleWatchers(): void {
    // Watch for theme changes (color theme: neutral, rose, blue, etc.)
    this.lifecycle.watch(
      watch(
        () => this.settings.theme.currentTheme,
        () => {
          console.log('🎨 [PlaygroundScene] Theme changed, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );

    this.lifecycle.watch(
      watch(
        () => this.settings.theme.colorMode,
        (newValue) => {
          console.log('🌗 [PlaygroundScene] Dark mode toggled, updating colors...');
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


    // Update all modules with the same unified API
    this.getModule('instancedSceneObjects')?.onThemeChange?.(theme);
    this.getModule('sceneObjects')?.onThemeChange?.(theme);
    this.getModule('treeTrunks')?.onThemeChange?.(theme);
    this.getModule('treeLeaves')?.onThemeChange?.(theme);
    this.getModule('bushes')?.onThemeChange?.(theme);
    this.getModule('ground')?.onThemeChange?.(theme);
    this.getModule('characterMesh')?.onThemeChange?.(theme);
  }
}
