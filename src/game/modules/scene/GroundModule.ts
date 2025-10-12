import { useSettingsStore, type ApplicationSettings } from '@/stores/settings.store';
import { I_ModuleContext } from '@/scenes/scenes.types';
import { I_SceneModule } from '@/scenes/scenes.types';
import { GridHelper, InstancedMesh, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import SceneModule from '@/game/SceneModule';
import { I_ThemeColors } from '@/composables/useTheme';

/**
 * Ground Module
 * Handles ground plane and grid helper
 */
export class GroundModule extends SceneModule implements I_SceneModule {
  private groundMaterial!: MeshStandardMaterial;
  private settings: ApplicationSettings;
  private ground!: InstancedMesh;
  private geometry!: PlaneGeometry;


  constructor(moduleName?: string) {
    super(moduleName);
    this.settings = useSettingsStore();
  }

  protected async init(context: I_ModuleContext): Promise<void> {
    // Create ground plane (visual)
    this.createGround();

    this.addToScene(context, this.ground);

    // Create Rapier ground collider (physics)
    this.addPhysics(context);

    // Add grid helper

    this.addGridHelper(context);


  }

  private createGround() {
    this.geometry = new PlaneGeometry(100, 100);
    this.groundMaterial = new MeshStandardMaterial({
      color: this.settings.theme.background,
    });

    this.ground = new InstancedMesh(this.geometry, this.groundMaterial, 1);
    this.ground.count = 1;
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
  }

  private addPhysics(context: I_ModuleContext) {
    if (context.services.physics.isReady()) {
      // Register ground physics using simple API
      context.services.physics.registerStatic('ground', {
        shape: 'cuboid',
        size: [100, 0.2, 100], // 100x0.2x100 box (width, height, depth)
        position: [0, 0, 0],
      });

      console.log('✅ [GroundModule] Ground physics registered');
    }
  }

  public addToScene(context: I_ModuleContext, ground: InstancedMesh) {
    context.scene.add(ground);
    context.lifecycle.register(ground);
  }

  public addGridHelper(context: I_ModuleContext,) {
    const gridHelper = new GridHelper(50, 50);
    gridHelper.position.y = 0.01;
    context.scene.add(gridHelper);
    context.lifecycle.register(gridHelper);
  }

  async destroy(): Promise<void> {
    // Lifecycle handles cleanup
  }

  /**
   * Optional lifecycle hook: React to theme changes
   */
  onThemeChange(theme: I_ThemeColors): void {
    this.groundMaterial.color.setHex(theme.background);
  }
}
