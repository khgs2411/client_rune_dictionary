import { I_ThemeColors } from '@/composables/useTheme';
import type { Engine } from '@/game/Engine';
import { GameScene } from '@/game/GameScene';
import { DebugModule } from '@/game/modules/scene/DebugModule';
import { LightingModule } from '@/game/modules/scene/LightingModule';
import { watch } from 'vue';
import { I_SceneConfig } from '../game/common/scenes.types';

import { GameObject } from '@/game/GameObject';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { InstancedMeshComponent } from '@/game/components/rendering/InstancedMeshComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MultiplayerModule } from '@/game/modules/networking/MultiplayerModule';
import { EditableBox } from '@/game/prefabs/EditableBox';
import { Ground } from '@/game/prefabs/Ground';
import { Trees } from '@/game/prefabs/Trees';
import { LocalPlayer } from '@/game/prefabs/character/LocalPlayer';

/**
 * Module Registry for PlaygroundScene
 * Defines all available modules with type-safe access
 */
interface PlaygroundModuleRegistry extends Record<string, any> {
  lighting: LightingModule;
  debug: DebugModule;
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
   */
  protected registerModules(): void {
    this.addModule('lighting', new LightingModule());
    this.addModule('multiplayer', new MultiplayerModule());
  }

  protected addSceneObjects() {
    // Ground
    const ground = new Ground({ size: 200, showGrid: true });
    const gom = this.getService('gameObjectsManager');
    gom.add(ground);

    // Editable box (using prefab)
    const modelComponentBox = new EditableBox({
      id: 'modelComponent-editable-box',
      position: [5, 1, 5],
      size: [1.5, 1.5, 1.5],
      useTheme: true,
      snapToGrid: this.config.editor.snapToGrid,
      tooltip: { title: 'modelComponent Box', description: 'Draggable in editor mode' },
      onDragEnd: (pos) => console.log('✅ modelComponent box dragged to:', pos),
    });

    // Trees (using prefab)
    const [treeTrunks, treeLeaves] = Trees.create({
      positions: [
        { x: 10, y: 0, z: 0 },
        { x: 12, y: 0, z: 2 },
        { x: 14, y: 0, z: -1 },
        { x: 10, y: 0, z: -3 },
        { x: 13, y: 0, z: -2 },
      ],
    });

    // Bushes (instanced, native components)
    const bushes = new GameObject({ id: 'bushes' })
      .addComponent(new GeometryComponent({ type: 'sphere', params: [0.4, 8, 8] }))
      .addComponent(new MaterialComponent({ color: 0x2d5016, roughness: 1.0 }))
      .addComponent(
        new InstancedMeshComponent({
          instances: [
            { position: [8, 0.3, 1] },
            { position: [11, 0.3, -1] },
            { position: [15, 0.3, 0] },
            { position: [9, 0.3, -4] },
          ],
        }),
      );
      
    gom.add(modelComponentBox);
    gom.add(treeTrunks);
    gom.add(treeLeaves);
    gom.add(bushes);



    // Create LocalPlayer GameObject (replaces CharacterModule)
    // Don't pass position config - let LocalPlayer read directly from controller
    const localPlayer = new LocalPlayer({
      playerId: 'local-player',
      characterController: this.character.controller,
    });

    gom.add(localPlayer);
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
          console.log('🎨 [PlaygroundScene] Theme changed, updating colors...');
          this.updateMaterialColors();
        },
      ),
    );

    this.cleanupRegistry.registerWatcher(
      watch(
        () => this.settings.theme.colorMode,
        () => {
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

    this.getService('gameObjectsManager').onThemeChange(theme);
  }
}
