import { useSettingsStore, type ApplicationSettings } from '@/stores/settings.store';
import { I_ModuleContext } from '@/scenes/scenes.types';
import { I_SceneModule } from '@/scenes/scenes.types';
import { GridHelper, InstancedMesh, Mesh, MeshStandardMaterial, PlaneGeometry } from 'three';
import SceneModule from '@/game/SceneModule';
import { I_ThemeColors } from '@/composables/useTheme';
import type * as RAPIER_TYPE from '@dimforge/rapier3d';

/**
 * Ground Module
 * Handles ground plane and grid helper
 */
export class GroundModule extends SceneModule implements I_SceneModule {
  private groundMaterial!: MeshStandardMaterial;
  private settings: ApplicationSettings;

  constructor( moduleName?: string) {
    super(moduleName);
    this.settings = useSettingsStore();
  }

  async start(context: I_ModuleContext): Promise<void> {
    // Create ground plane (visual)
    const geometry = new PlaneGeometry(100, 100);
    this.groundMaterial = new MeshStandardMaterial({
      color: this.settings.theme.background,
    });

    const ground = new InstancedMesh(geometry, this.groundMaterial, 1);
    ground.count = 1;
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    context.scene.add(ground);
    context.lifecycle.register(ground);

    // Create Rapier ground collider (physics)
    if (context.services.physics.isReady()) {
      const RAPIER = context.services.physics.getRapier();
      const world = context.services.physics.getWorld();

      // Create static rigid body at ground level (Y=0)
      const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
      groundBodyDesc.setTranslation(0, 0, 0);
      const groundBody = world.createRigidBody(groundBodyDesc);

      // Create large cuboid collider for ground (very thin box)
      const groundColliderDesc = RAPIER.ColliderDesc.cuboid(50, 0.1, 50); // 100x0.2x100 box
      world.createCollider(groundColliderDesc, groundBody);

      console.log('✅ [GroundModule] Rapier ground collider created');
    }

    // Add grid helper
    const gridHelper = new GridHelper(50, 50);
    gridHelper.position.y = 0.01;
    this.addToScene(context, gridHelper);

    // Emit loading complete event
    super.start(context);
  }

  public addToScene(context: I_ModuleContext, gridHelper: GridHelper) {
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
