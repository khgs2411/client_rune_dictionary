import { GameObject } from '@/game/GameObject';
import { CollisionComponent } from '@/game/components/interactions/CollisionComponent';
import { GeometryComponent } from '@/game/components/rendering/GeometryComponent';
import { MaterialComponent } from '@/game/components/rendering/MaterialComponent';
import { MeshComponent } from '@/game/components/rendering/MeshComponent';
import { TransformComponent } from '@/game/components/rendering/TransformComponent';

interface HillConfig {
  position: [number, number, number];
  scale?: [number, number, number];
}

export class Hill extends GameObject {
  constructor(config: HillConfig) {
    super({ id: `hill-${Math.random().toString(36).substr(2, 9)}` });

    const scale = config.scale || [1, 1, 1];

    this.addComponent(
      new TransformComponent({
        position: config.position,
        scale: scale,
      }),
    )
      .addComponent(
        new GeometryComponent({
          type: 'sphere',
          params: [10, 16, 16], // Large sphere
        }),
      )
      .addComponent(
        new MaterialComponent({
          color: 0x55aa55, // Grass green
          roughness: 0.9,
          metalness: 0.1,
        }),
      )
      .addComponent(new MeshComponent())
      .addComponent(
        new CollisionComponent({
          type: 'static',
          shape: 'sphere', // Correct shape type
        }),
      );
  }
}
