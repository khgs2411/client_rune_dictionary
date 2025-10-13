import SceneModule from '@/game/SceneModule';
import type { I_ModuleContext, I_SceneModule } from '@/game/common/scenes.types';
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Sprite,
  SpriteMaterial,
  Vector3,
} from 'three';
import { Text } from 'troika-three-text';

/**
 * Text Sprite - Flyweight pattern for reusable text effects
 */
class TextSprite {
  sprite: Sprite;
  private inUse = false;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    // Create canvas for text rendering
    this.canvas = document.createElement('canvas');
    this.canvas.width = 512;
    this.canvas.height = 256;
    this.ctx = this.canvas.getContext('2d')!;

    // Create sprite with canvas texture
    const texture = new CanvasTexture(this.canvas);
    const material = new SpriteMaterial({ map: texture, transparent: true });
    this.sprite = new Sprite(material);
    this.sprite.scale.set(2, 1, 1);
    this.sprite.visible = false;
  }

  setText(text: string, color: string = '#FFD700'): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw comic book style text
    this.ctx.font = 'bold 96px Impact, Arial Black, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    // Outline
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 12;
    this.ctx.strokeText(text, 256, 128);

    // Fill
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, 256, 128);

    // Update texture
    (this.sprite.material.map as CanvasTexture).needsUpdate = true;
    this.inUse = true;
    this.sprite.visible = true;
  }

  reset(): void {
    this.inUse = false;
    this.sprite.visible = false;
    this.sprite.position.set(0, 0, 0);
    this.sprite.scale.set(2, 1, 1);
    this.sprite.material.opacity = 1;
  }

  isAvailable(): boolean {
    return !this.inUse;
  }
}

/**
 * Tooltip Billboard - Always faces camera (using troika-three-text for crisp rendering!)
 */
class TooltipBillboard {
  group: Group;
  private titleText!: Text;
  private descriptionText!: Text;
  private backgroundMesh!: Mesh;
  private inUse = false;

  constructor() {
    this.group = new Group();

    this.createBackground();
    this.createTextObjects();

    this.group.visible = false;
  }

  private createBackground(): void {
    const geometry = new PlaneGeometry(3, 1, 32, 32);
    const canvas = this.createRoundedRectCanvas();

    const texture = new CanvasTexture(canvas);
    texture.minFilter = LinearFilter; // Smooth scaling
    texture.magFilter = LinearFilter;
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide,
      depthWrite: false, // Prevent z-fighting with text
    });

    this.backgroundMesh = new Mesh(geometry, material);
    this.backgroundMesh.renderOrder = -1; // Render background FIRST
    this.group.add(this.backgroundMesh);
  }

  /**
   * Create rounded rectangle canvas for tooltip background
   * Uses 4x resolution (2048x1024) for crisp borders
   */
  private createRoundedRectCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = 2048; // 4x resolution for crisp rendering
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    const radius = 160; // Corner radius (40px * 4 for 4x canvas)

    // Draw rounded rectangle path
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(canvas.width - radius, 0);
    ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
    ctx.lineTo(canvas.width, canvas.height - radius);
    ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - radius, canvas.height);
    ctx.lineTo(radius, canvas.height);
    ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();

    // Fill with solid dark background
    ctx.fillStyle = 'rgba(20, 20, 20, 1.0)';
    ctx.fill();

    // Add subtle orange border
    ctx.strokeStyle = 'rgba(255, 140, 0, 0.6)';
    ctx.lineWidth = 16; // 4px * 4 for 4x canvas
    ctx.stroke();

    // Add subtle inner glow
    ctx.shadowColor = 'rgba(255, 140, 0, 0.3)';
    ctx.shadowBlur = 40; // 10px * 4 for 4x canvas
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.stroke();

    return canvas;
  }

  private createTextObjects(): void {
    // Title text using troika-three-text (SDF rendering - crisp at any scale!)
    this.titleText = new Text();
    this.titleText.fontSize = 0.22; // World-space size
    this.titleText.color = 0xffffff;
    this.titleText.anchorX = 'center';
    this.titleText.anchorY = 'middle';
    this.titleText.position.set(0, 0.2, 0.02); // In front of background
    this.titleText.renderOrder = 1;

    // Add subtle glow effect via material properties
    this.titleText.outlineWidth = 0.01;
    this.titleText.outlineColor = 0xff8c00; // Orange glow
    this.titleText.outlineOpacity = 0.5;

    this.group.add(this.titleText);

    // Description text using troika-three-text
    this.descriptionText = new Text();
    this.descriptionText.fontSize = 0.14;
    this.descriptionText.color = 0xcccccc;
    this.descriptionText.anchorX = 'center';
    this.descriptionText.anchorY = 'middle';
    this.descriptionText.position.set(0, -0.15, 0.02);
    this.descriptionText.renderOrder = 1;

    // Subtle glow for description
    this.descriptionText.outlineWidth = 0.005;
    this.descriptionText.outlineColor = 0xffffff;
    this.descriptionText.outlineOpacity = 0.3;

    this.group.add(this.descriptionText);
  }

  setText(title: string, description?: string): void {
    // Set title text (SDF rendering handles all the quality!)
    this.titleText.text = title;
    this.titleText.sync(); // Important: trigger rendering

    // Set description text (if provided)
    if (description) {
      this.descriptionText.text = description;
      this.descriptionText.visible = true;
      this.descriptionText.sync();

      // Adjust background height for description
      this.backgroundMesh.scale.set(1, 1.3, 1);
    } else {
      this.descriptionText.visible = false;
      this.backgroundMesh.scale.set(1, 0.7, 1);
    }

    this.inUse = true;
    this.group.visible = true;
  }

  setPosition(worldPosition: Vector3, offset: Vector3 = new Vector3(0, 1.5, 0)): void {
    this.group.position.copy(worldPosition).add(offset);
  }

  faceCamera(cameraPosition: Vector3): void {
    this.group.lookAt(cameraPosition);
  }

  reset(): void {
    this.inUse = false;
    this.group.visible = false;
  }

  isAvailable(): boolean {
    return !this.inUse;
  }
}

/**
 * Particle System - Simple particle burst effect
 */
class ParticleSystem {
  points: Points;
  private particles: { position: Vector3; velocity: Vector3; life: number }[] = [];
  private geometry: BufferGeometry;
  private material: PointsMaterial;
  private maxParticles = 100;
  private inUse = false;

  constructor() {
    this.geometry = new BufferGeometry();
    this.material = new PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true,
    });
    this.points = new Points(this.geometry, this.material);
    this.points.visible = false;
  }

  spawn(position: Vector3, count: number, color: number, speed: number): void {
    this.inUse = true;
    this.points.visible = true;
    this.material.color.setHex(color);
    this.particles = [];

    // Create particles in random directions
    for (let i = 0; i < Math.min(count, this.maxParticles); i++) {
      const angle = (Math.PI * 2 * i) / count;
      const velocity = new Vector3(
        Math.cos(angle) * speed + (Math.random() - 0.5),
        Math.random() * speed * 2,
        Math.sin(angle) * speed + (Math.random() - 0.5),
      );

      this.particles.push({
        position: position.clone(),
        velocity,
        life: 1.0,
      });
    }

    this.updateGeometry();
  }

  update(delta: number): void {
    if (!this.inUse || this.particles.length === 0) return;

    let allDead = true;

    this.particles.forEach((particle) => {
      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(delta));

      // Apply gravity
      particle.velocity.y -= 9.8 * delta;

      // Decrease life
      particle.life -= delta;

      if (particle.life > 0) {
        allDead = false;
      }
    });

    // Update material opacity
    this.material.opacity = Math.max(0, this.particles[0]?.life || 0);

    this.updateGeometry();

    if (allDead) {
      this.reset();
    }
  }

  private updateGeometry(): void {
    const positions: number[] = [];
    this.particles.forEach((particle) => {
      if (particle.life > 0) {
        positions.push(particle.position.x, particle.position.y, particle.position.z);
      }
    });

    this.geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    this.geometry.attributes.position.needsUpdate = true;
  }

  reset(): void {
    this.inUse = false;
    this.points.visible = false;
    this.particles = [];
  }

  isAvailable(): boolean {
    return !this.inUse;
  }
}

/**
 * VFX Module - Visual Effects with Object Pooling
 * Handles text sprites, tooltips, particle effects, etc.
 */
export class VFXModule extends SceneModule implements I_SceneModule {
  // Pool size constants
  private static readonly POOL_SIZES = {
    TEXT_SPRITES: 10, // POW!/BAM! text effects
    TOOLTIPS: 3, // Usually only need 1 active at a time
    PARTICLES: 5, // Particle burst systems
  } as const;


  // Object pools
  private textSpritePool: TextSprite[] = [];
  private tooltipPool: TooltipBillboard[] = [];
  private particlePool: ParticleSystem[] = [];

  // Active animations
  private activeTextAnims = new Map<
    TextSprite,
    { startTime: number; duration: number; startPos: Vector3 }
  >();
  private activeTooltip: TooltipBillboard | null = null;

  // Material cache for emissive glow
  private materialCache = new Map<string, { emissive: Color; emissiveIntensity: number }>();

  // Camera shake state
  private cameraShake: { intensity: number; duration: number; elapsed: number } | null = null;

  protected async init(context: I_ModuleContext): Promise<void> {
    this.context = context;

    // Pre-create text sprite pool
    for (let i = 0; i < VFXModule.POOL_SIZES.TEXT_SPRITES; i++) {
      const sprite = new TextSprite();
      context.scene.add(sprite.sprite);
      context.cleanupRegistry.registerObject(sprite.sprite);
      this.textSpritePool.push(sprite);
    }

    // Pre-create tooltip pool
    for (let i = 0; i < VFXModule.POOL_SIZES.TOOLTIPS; i++) {
      const tooltip = new TooltipBillboard();
      context.scene.add(tooltip.group);
      context.cleanupRegistry.registerObject(tooltip.group);
      this.tooltipPool.push(tooltip);
    }

    // Pre-create particle systems pool
    for (let i = 0; i < VFXModule.POOL_SIZES.PARTICLES; i++) {
      const particles = new ParticleSystem();
      context.scene.add(particles.points);
      context.cleanupRegistry.registerObject(particles.points);
      this.particlePool.push(particles);
    }

    console.log(
      '✨ [VFXModule] Initialized with pools (text: %d, tooltips: %d, particles: %d)',
      this.textSpritePool.length,
      this.tooltipPool.length,
      this.particlePool.length,
    );

  }

  update(delta: number): void {
    this.updateTextSpriteAnimations();
    this.updateTooltipBillboard();
    this.updateParticleSystems(delta);
    this.updateCameraShake(delta);
  }

  /**
   * Update text sprite animations (POW! BAM! effects)
   */
  private updateTextSpriteAnimations(): void {
    const now = Date.now();

    this.activeTextAnims.forEach((anim, sprite) => {
      const elapsed = now - anim.startTime;
      const progress = elapsed / anim.duration;

      if (progress >= 1) {
        // Animation complete - return to pool
        sprite.reset();
        this.activeTextAnims.delete(sprite);
      } else {
        // Animate: rise + fade + scale (eased cubic out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        sprite.sprite.position.y = anim.startPos.y + easeOut * 2;
        sprite.sprite.material.opacity = 1 - progress;
        sprite.sprite.scale.set(2 * (1 + progress * 0.5), 1 * (1 + progress * 0.5), 1);
      }
    });
  }

  /**
   * Update tooltip billboard to always face camera
   */
  private updateTooltipBillboard(): void {
    if (this.activeTooltip && this.context.camera) {
      this.activeTooltip.faceCamera(this.context.camera.instance.position);
    }
  }

  /**
   * Update all particle systems in pool
   */
  private updateParticleSystems(delta: number): void {
    this.particlePool.forEach((particles) => {
      particles.update(delta);
    });
  }

  /**
   * Update camera shake effect (fades out over duration)
   */
  private updateCameraShake(delta: number): void {
    if (!this.cameraShake || !this.context.camera) return;

    this.cameraShake.elapsed += delta;

    if (this.cameraShake.elapsed >= this.cameraShake.duration) {
      // Shake complete - snap camera position to prevent floating point drift
      // (Round to nearest 0.01 to clean up accumulated shake offsets)
      const camera = this.context.camera.instance;
      camera.position.x = Math.round(camera.position.x * 100) / 100;
      camera.position.y = Math.round(camera.position.y * 100) / 100;
      this.cameraShake = null;
    } else {
      // Apply shake with fade-out (intensity decreases over time)
      const progress = this.cameraShake.elapsed / this.cameraShake.duration;
      const intensity = this.cameraShake.intensity * (1 - progress);

      this.context.camera.instance.position.x += (Math.random() - 0.5) * intensity;
      this.context.camera.instance.position.y += (Math.random() - 0.5) * intensity;
    }
  }

  async destroy(): Promise<void> {
    this.activeTextAnims.clear();
    this.activeTooltip = null;
    this.materialCache.clear();
  }

  // ============================================
  // PUBLIC API
  // ============================================

  /**
   * Show click effect (POW! BAM! etc.)
   */
  showClickEffect(worldPosition: Vector3, text: string = 'POW!', color?: string): void {
    const sprite = this.textSpritePool.find((s) => s.isAvailable());
    if (!sprite) {
      console.warn('[VFXModule] No available text sprites in pool');
      return;
    }

    const texts = ['POW!', 'BAM!', 'CLICK!', 'ZAP!', 'WHAM!'];
    const finalText = text || texts[Math.floor(Math.random() * texts.length)];

    sprite.setText(finalText, color);
    sprite.sprite.position.copy(worldPosition);

    this.activeTextAnims.set(sprite, {
      startTime: Date.now(),
      duration: 1000,
      startPos: worldPosition.clone(),
    });
  }

  /**
   * Show world-space tooltip (billboard that faces camera)
   */
  showTooltip(worldPosition: Vector3, title: string, description?: string): void {
    // Hide previous tooltip
    this.hideTooltip();

    const tooltip = this.tooltipPool.find((t) => t.isAvailable());
    if (!tooltip) {
      console.warn('[VFXModule] No available tooltips in pool');
      return;
    }

    tooltip.setText(title, description);
    tooltip.setPosition(worldPosition);

    // Face camera immediately
    if (this.context.camera) {
      tooltip.faceCamera(this.context.camera.instance.position);
    }

    this.activeTooltip = tooltip;
  }

  /**
   * Hide active tooltip
   */
  hideTooltip(): void {
    if (this.activeTooltip) {
      this.activeTooltip.reset();
      this.activeTooltip = null;
    }
  }

  /**
   * Apply emissive glow to object (for hover effects)
   */
  applyEmissive(object3D: Object3D, color: number, intensity: number): void {
    object3D.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as Mesh;
        const mat = mesh.material as any; // Material types vary

        // Cache original material if it has emissive properties
        if (!this.materialCache.has(mesh.uuid) && mat.emissive) {
          this.materialCache.set(mesh.uuid, {
            emissive: mat.emissive.clone(),
            emissiveIntensity: mat.emissiveIntensity,
          });
        }

        // Apply glow
        if (mat.emissive) {
          mat.emissive.setHex(color);
          mat.emissiveIntensity = intensity;
        }
      }
    });
  }

  /**
   * Restore original emissive for object
   */
  restoreEmissive(object3D: Object3D): void {
    object3D.traverse((child) => {
      if ('isMesh' in child && child.isMesh) {
        const mesh = child as Mesh;
        const original = this.materialCache.get(mesh.uuid);

        if (original) {
          const mat = mesh.material as any; // Material types vary
          if (mat.emissive) {
            mat.emissive.copy(original.emissive);
            mat.emissiveIntensity = original.emissiveIntensity;
          }
        }
      }
    });
  }

  /**
   * Spawn particle burst effect
   */
  spawnParticles(
    worldPosition: Vector3,
    count: number = 20,
    color: number = 0xffd700,
    speed: number = 3,
  ): void {
    const particles = this.particlePool.find((p) => p.isAvailable());
    if (!particles) {
      console.warn('[VFXModule] No available particle systems in pool');
      return;
    }

    particles.spawn(worldPosition, count, color, speed);
  }

  /**
   * Trigger camera shake
   */
  shakeCamera(intensity: number = 0.1, duration: number = 0.3): void {
    this.cameraShake = {
      intensity,
      duration,
      elapsed: 0,
    };
  }
}
