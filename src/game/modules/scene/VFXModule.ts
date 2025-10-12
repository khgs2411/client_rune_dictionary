import SceneModule from '@/game/SceneModule';
import type { I_ModuleContext, I_SceneModule } from '@/scenes/scenes.types';
import {
  CanvasTexture,
  Color,
  Sprite,
  SpriteMaterial,
  Vector3,
  Group,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  DoubleSide,
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
} from 'three';

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
 * Tooltip Billboard - Always faces camera
 */
class TooltipBillboard {
  group: Group;
  private titleMesh!: Mesh;
  private descriptionMesh!: Mesh;
  private backgroundMesh!: Mesh;
  private inUse = false;
  private titleCanvas: HTMLCanvasElement;
  private descriptionCanvas: HTMLCanvasElement;

  constructor() {
    this.group = new Group();
    this.titleCanvas = document.createElement('canvas');
    this.descriptionCanvas = document.createElement('canvas');

    this.createBackground();
    this.createTextMeshes();

    this.group.visible = false;
  }

  private createBackground(): void {
    // Stylish rounded background with border
    const geometry = new PlaneGeometry(3, 1, 32, 32);

    // Create a canvas for the background with rounded corners
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    // Draw rounded rectangle background
    const radius = 32;
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

    // Fill with dark background
    ctx.fillStyle = 'rgba(20, 20, 20, 0.95)';
    ctx.fill();

    // Add subtle border
    ctx.strokeStyle = 'rgba(255, 140, 0, 0.6)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Add subtle inner glow
    ctx.shadowColor = 'rgba(255, 140, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.stroke();

    const texture = new CanvasTexture(canvas);
    const material = new MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: DoubleSide,
    });

    this.backgroundMesh = new Mesh(geometry, material);
    this.group.add(this.backgroundMesh);
  }

  private createTextMeshes(): void {
    // Title mesh
    this.titleCanvas.width = 512;
    this.titleCanvas.height = 128;
    const titleTexture = new CanvasTexture(this.titleCanvas);
    const titleMaterial = new MeshBasicMaterial({
      map: titleTexture,
      transparent: true,
      side: DoubleSide,
    });
    const titleGeometry = new PlaneGeometry(2.8, 0.4);
    this.titleMesh = new Mesh(titleGeometry, titleMaterial);
    this.titleMesh.position.set(0, 0.2, 0.01);
    this.group.add(this.titleMesh);

    // Description mesh
    this.descriptionCanvas.width = 512;
    this.descriptionCanvas.height = 128;
    const descTexture = new CanvasTexture(this.descriptionCanvas);
    const descMaterial = new MeshBasicMaterial({
      map: descTexture,
      transparent: true,
      side: DoubleSide,
    });
    const descGeometry = new PlaneGeometry(2.8, 0.3);
    this.descriptionMesh = new Mesh(descGeometry, descMaterial);
    this.descriptionMesh.position.set(0, -0.15, 0.01);
    this.group.add(this.descriptionMesh);
  }

  setText(title: string, description?: string): void {
    // Render title with better styling
    const titleCtx = this.titleCanvas.getContext('2d')!;
    titleCtx.clearRect(0, 0, this.titleCanvas.width, this.titleCanvas.height);

    // Title with gradient and glow
    titleCtx.font = 'bold 56px Arial, sans-serif';
    titleCtx.textAlign = 'center';
    titleCtx.textBaseline = 'middle';

    // Add glow effect
    titleCtx.shadowColor = 'rgba(255, 140, 0, 0.8)';
    titleCtx.shadowBlur = 15;
    titleCtx.shadowOffsetX = 0;
    titleCtx.shadowOffsetY = 0;

    // Gradient fill
    const gradient = titleCtx.createLinearGradient(0, 0, 0, 128);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#ffcc99');
    titleCtx.fillStyle = gradient;
    titleCtx.fillText(title, 256, 64);

    (this.titleMesh.material as MeshBasicMaterial).map!.needsUpdate = true;

    // Render description (if provided)
    this.descriptionMesh.visible = !!description;
    if (description) {
      const descCtx = this.descriptionCanvas.getContext('2d')!;
      descCtx.clearRect(0, 0, this.descriptionCanvas.width, this.descriptionCanvas.height);

      descCtx.font = '36px Arial, sans-serif';
      descCtx.textAlign = 'center';
      descCtx.textBaseline = 'middle';

      // Subtle glow for description
      descCtx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      descCtx.shadowBlur = 8;

      descCtx.fillStyle = '#cccccc';
      descCtx.fillText(description, 256, 64);
      (this.descriptionMesh.material as MeshBasicMaterial).map!.needsUpdate = true;

      // Adjust background height
      this.backgroundMesh.scale.set(1, 1.3, 1);
    } else {
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
        Math.sin(angle) * speed + (Math.random() - 0.5)
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
  private context!: I_ModuleContext;

  // Object pools
  private textSpritePool: TextSprite[] = [];
  private tooltipPool: TooltipBillboard[] = [];
  private particlePool: ParticleSystem[] = [];

  // Active animations
  private activeTextAnims = new Map<TextSprite, { startTime: number; duration: number; startPos: Vector3 }>();
  private activeTooltip: TooltipBillboard | null = null;

  // Material cache for emissive glow
  private materialCache = new Map<string, { emissive: Color; emissiveIntensity: number }>();

  // Camera shake state
  private cameraShake: { intensity: number; duration: number; elapsed: number } | null = null;

  async start(context: I_ModuleContext): Promise<void> {
    this.context = context;

    // Pre-create text sprite pool (10 sprites)
    for (let i = 0; i < 10; i++) {
      const sprite = new TextSprite();
      context.scene.add(sprite.sprite);
      context.lifecycle.register(sprite.sprite);
      this.textSpritePool.push(sprite);
    }

    // Pre-create tooltip pool (3 tooltips - usually only need 1)
    for (let i = 0; i < 3; i++) {
      const tooltip = new TooltipBillboard();
      context.scene.add(tooltip.group);
      context.lifecycle.register(tooltip.group);
      this.tooltipPool.push(tooltip);
    }

    // Pre-create particle systems pool (5 systems)
    for (let i = 0; i < 5; i++) {
      const particles = new ParticleSystem();
      context.scene.add(particles.points);
      context.lifecycle.register(particles.points);
      this.particlePool.push(particles);
    }

    console.log('✨ [VFXModule] Initialized with pools (text: %d, tooltips: %d, particles: %d)',
      this.textSpritePool.length,
      this.tooltipPool.length,
      this.particlePool.length
    );

    this.initialized(context.sceneName);
  }

  update(delta: number): void {
    const now = Date.now();

    // Animate text sprites
    this.activeTextAnims.forEach((anim, sprite) => {
      const elapsed = now - anim.startTime;
      const progress = elapsed / anim.duration;

      if (progress >= 1) {
        // Animation complete - return to pool
        sprite.reset();
        this.activeTextAnims.delete(sprite);
      } else {
        // Animate: rise + fade + scale
        const easeOut = 1 - Math.pow(1 - progress, 3);
        sprite.sprite.position.y = anim.startPos.y + easeOut * 2;
        sprite.sprite.material.opacity = 1 - progress;
        sprite.sprite.scale.set(2 * (1 + progress * 0.5), 1 * (1 + progress * 0.5), 1);
      }
    });

    // Update tooltip billboard to face camera
    if (this.activeTooltip && this.context.camera) {
      this.activeTooltip.faceCamera(this.context.camera.instance.position);
    }

    // Update particle systems
    this.particlePool.forEach((particles) => {
      particles.update(delta);
    });

    // Update camera shake
    if (this.cameraShake && this.context.camera) {
      this.cameraShake.elapsed += delta;

      if (this.cameraShake.elapsed >= this.cameraShake.duration) {
        // Reset camera position
        this.context.camera.instance.position.x -= this.context.camera.instance.position.x % 0.01;
        this.context.camera.instance.position.y -= this.context.camera.instance.position.y % 0.01;
        this.cameraShake = null;
      } else {
        // Apply shake
        const progress = this.cameraShake.elapsed / this.cameraShake.duration;
        const intensity = this.cameraShake.intensity * (1 - progress); // Fade out

        this.context.camera.instance.position.x += (Math.random() - 0.5) * intensity;
        this.context.camera.instance.position.y += (Math.random() - 0.5) * intensity;
      }
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
  applyEmissive(object3D: any, color: number, intensity: number): void {
    object3D.traverse((child: any) => {
      if (child.isMesh) {
        const mat = child.material;

        // Cache original material
        if (!this.materialCache.has(child.uuid) && mat.emissive) {
          this.materialCache.set(child.uuid, {
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
  restoreEmissive(object3D: any): void {
    object3D.traverse((child: any) => {
      const original = this.materialCache.get(child.uuid);
      if (original && child.isMesh) {
        const mat = child.material;
        if (mat.emissive) {
          mat.emissive.copy(original.emissive);
          mat.emissiveIntensity = original.emissiveIntensity;
        }
      }
    });
  }

  /**
   * Spawn particle burst effect
   */
  spawnParticles(worldPosition: Vector3, count: number = 20, color: number = 0xffd700, speed: number = 3): void {
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
