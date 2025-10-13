import { GameObject } from '../GameObject';
import { TransformComponent } from '../components/rendering/TransformComponent';
import { GeometryComponent } from '../components/rendering/GeometryComponent';
import { MaterialComponent } from '../components/rendering/MaterialComponent';
import { MeshComponent } from '../components/rendering/MeshComponent';
import { PhysicsComponent } from '../components/interaction/PhysicsComponent';
import { DragComponent } from '../components/interaction/DragComponent';
import { HoverComponent } from '../components/interaction/HoverComponent';
import { PersistenceComponent } from '../components/system/PersistenceComponent';
import type { Vector3 } from 'three';

export interface I_EditableBoxConfig {
  id: string;
  position?: [number, number, number];
  size?: [number, number, number];
  color?: number;
  onDragEnd?: (position: Vector3) => void;
}

/**
 * EditableBox Prefab - A draggable, physics-enabled, persistent box
 *
 * This is a pre-configured GameObject with all the components needed for
 * a level-editor editable object.
 *
 * Features:
 * - Visual mesh (box geometry with customizable color)
 * - Physics collider (static body)
 * - Drag interaction (XZ plane, locked Y axis)
 * - Hover glow effect
 * - Position persistence (auto-saves on drag, loads on scene start)
 *
 * Usage:
 * ```typescript
 * const box = new EditableBox({
 *   id: 'pink-box',
 *   position: [0, 1, 0],
 *   size: [1, 1, 1],
 *   color: 0xff1493,
 *   onDragEnd: (pos) => console.log('Box dragged to:', pos)
 * });
 *
 * gameObjectManager.add(box);
 * ```
 */
export class EditableBox extends GameObject {
  constructor(config: I_EditableBoxConfig) {
    super({ id: config.id });

    // Rendering components
    this.addComponent(
      new TransformComponent({
        position: config.position || [0, 1, 0],
      }),
    )
      .addComponent(
        new GeometryComponent({
          type: 'box',
          params: config.size || [1, 1, 1],
        }),
      )
      .addComponent(
        new MaterialComponent({
          color: config.color || 0xff1493,
          roughness: 0.8,
          metalness: 0.2,
        }),
      )
      .addComponent(new MeshComponent());

    // Physics
    this.addComponent(
      new PhysicsComponent({
        type: 'static',
        shape: 'cuboid',
      }),
    );

    // Interactions
    this.addComponent(
      new DragComponent({
        lockAxis: ['y'],
        snapToGrid: 0.5,
        onEnd: config.onDragEnd,
      }),
    ).addComponent(
      new HoverComponent({
        glowColor: 0xff8c00,
      }),
    );

    // Persistence (auto-saves position on drag)
    this.addComponent(new PersistenceComponent());
  }
}
