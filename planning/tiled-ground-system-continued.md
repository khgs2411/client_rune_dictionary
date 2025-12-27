# Ground Tile System - Complete Implementation Plan

## Document Info
- **Feature**: HD-2D Ground Tile System
- **Status**: Ready for Implementation
- **Estimated Effort**: 7-8 days
- **Dependencies**: Existing TileChunkMeshComponent, TileMapModule, PhysicsSystem

---

## Executive Summary

Redesign the ground tile system to support three rendering modes through a unified architecture:

1. **Procedural/Auto-tiling** (priority) - Noise-based terrain with tileset atlas
2. **Manual tiling** - Place specific tiles from a tileset atlas
3. **Single large image** - One sprite covering the ground

**Key Features**:
- HD-2D style with layered sprites at different Y elevations
- 3D collision volumes allowing player to walk ON and UNDER platforms
- Tileset atlas rendering with proper pixel-art configuration
- Code-only for now (no LDtk integration)

---

## Architecture Decisions

### Decision 1: Extend Existing Components (Don't Replace)

**Choice**: Extend `TileChunkMeshComponent` with tileset support rather than creating new renderer.

**Rationale**: 
- TileChunkMeshComponent already has InstancedMesh with tileIndex attribute
- Maintains consistency with existing ECS patterns
- Reduces code duplication

### Decision 2: One TileChunk Per Layer (Not One InstancedMesh Per Layer)

**Choice**: Each elevation layer spawns its own TileChunk GameObject at different Y positions.

**Rationale**:
- Simpler than managing multiple InstancedMesh arrays in one component
- Works with existing TileMapModule chunk lifecycle
- Each layer can have independent frustum culling

### Decision 3: No Chunking for Match Arenas

**Choice**: For maps under 100x100 tiles, use single merged geometry per layer.

**Rationale**:
- Match arenas are small (typically 32x32 to 64x64)
- Chunking adds complexity without benefit at this scale
- Reserve chunking for future open-world exploration mode

### Decision 4: Keep 4-Bit Auto-Tiling (For Now)

**Choice**: Continue using existing 16-tile auto-tiling system.

**Rationale**:
- 47-tile blob algorithm requires specific tileset art
- Current system works for initial implementation
- Can upgrade later when art assets are ready

---

## Phase 1: TileAtlas Material

**Goal**: Replace rainbow debug colors with actual tileset texture rendering.

**Duration**: 1-2 days

### Files to Create

#### `src/game/shaders/TileAtlasShader.ts`

```typescript
/**
 * TileAtlasShader - GLSL shaders for tileset atlas sampling
 * 
 * Handles:
 * - Per-instance tile index lookup
 * - Half-texel inset to prevent texture bleeding
 * - Proper UV calculation for atlas grid
 */

export const TILE_ATLAS_VERTEX = /* glsl */ `
  // Per-instance attribute from TileChunkMeshComponent
  attribute float tileIndex;
  
  // Pass to fragment shader
  varying vec2 vUv;
  varying float vTileIndex;
  
  void main() {
    vUv = uv;
    vTileIndex = tileIndex;
    
    // Apply instance transform (position in world)
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

export const TILE_ATLAS_FRAGMENT = /* glsl */ `
  // Atlas configuration uniforms
  uniform sampler2D uAtlas;
  uniform float uTilesPerRow;    // e.g., 16 for 16-column atlas
  uniform float uAtlasSize;      // e.g., 256.0 for 256x256 texture
  uniform float uTilePixelSize;  // e.g., 16.0 for 16x16 tiles
  
  varying vec2 vUv;
  varying float vTileIndex;
  
  void main() {
    // Calculate tile position in atlas grid
    float tileX = mod(vTileIndex, uTilesPerRow);
    float tileY = floor(vTileIndex / uTilesPerRow);
    
    // Normalized tile size (0-1 range)
    float tileSizeNorm = uTilePixelSize / uAtlasSize;
    
    // Half-texel inset to prevent bleeding at tile edges
    // This is CRITICAL for pixel art - samples texel centers, not edges
    float halfTexel = 0.5 / uAtlasSize;
    float insetScale = 1.0 - (2.0 * halfTexel / tileSizeNorm);
    float insetOffset = halfTexel / tileSizeNorm;
    
    // Apply inset to local UV (0-1 within this tile)
    vec2 insetUV = vUv * insetScale + insetOffset;
    
    // Calculate final atlas UV
    vec2 atlasUV = vec2(tileX, tileY) * tileSizeNorm + insetUV * tileSizeNorm;
    
    // Flip Y axis (Three.js UV origin is bottom-left, most atlases are top-left)
    atlasUV.y = 1.0 - atlasUV.y;
    
    // Sample texture
    vec4 texColor = texture2D(uAtlas, atlasUV);
    
    // Discard transparent pixels (alpha cutoff)
    if (texColor.a < 0.1) discard;
    
    gl_FragColor = texColor;
  }
`;
```

#### `src/game/materials/TileAtlasMaterial.ts`

```typescript
/**
 * TileAtlasMaterial - ShaderMaterial factory for tileset rendering
 * 
 * CRITICAL: Applies correct texture configuration for pixel art:
 * - NearestFilter (no bilinear smoothing)
 * - No mipmaps (prevents mip-level bleeding)
 * - SRGB color space (correct color reproduction)
 * - ClampToEdge wrapping (no repeat artifacts)
 */

import {
  ShaderMaterial,
  Texture,
  NearestFilter,
  SRGBColorSpace,
  ClampToEdgeWrapping,
  DoubleSide,
} from "three";
import { TILE_ATLAS_VERTEX, TILE_ATLAS_FRAGMENT } from "../shaders/TileAtlasShader";

export interface I_TileAtlasMaterialConfig {
  /** Loaded Three.js texture */
  atlasTexture: Texture;
  /** Atlas texture size in pixels (e.g., 256, 512) */
  atlasPixelSize: number;
  /** Individual tile size in pixels (e.g., 16, 32) */
  tilePixelSize: number;
  /** Number of tile columns in atlas (e.g., 16 for 256px atlas with 16px tiles) */
  tilesPerRow: number;
}

/**
 * Create a ShaderMaterial configured for tileset atlas sampling
 * 
 * @example
 * ```typescript
 * const texture = await new TextureLoader().loadAsync('/tilesets/terrain.png');
 * const material = createTileAtlasMaterial({
 *   atlasTexture: texture,
 *   atlasPixelSize: 256,
 *   tilePixelSize: 16,
 *   tilesPerRow: 16,
 * });
 * ```
 */
export function createTileAtlasMaterial(config: I_TileAtlasMaterialConfig): ShaderMaterial {
  const { atlasTexture, atlasPixelSize, tilePixelSize, tilesPerRow } = config;
  
  // ============================================================
  // CRITICAL: Pixel Art Texture Configuration
  // Missing ANY of these causes visual artifacts
  // ============================================================
  
  // NearestFilter: Sharp pixels, no bilinear interpolation
  atlasTexture.magFilter = NearestFilter;
  atlasTexture.minFilter = NearestFilter;
  
  // Disable mipmaps: Prevents sampling from wrong mip level at tile edges
  atlasTexture.generateMipmaps = false;
  
  // SRGB color space: Correct gamma for web display (required since Three.js r152)
  atlasTexture.colorSpace = SRGBColorSpace;
  
  // ClampToEdge: Prevents wrapping artifacts at atlas boundaries
  atlasTexture.wrapS = ClampToEdgeWrapping;
  atlasTexture.wrapT = ClampToEdgeWrapping;
  
  // Mark texture as needing update after config changes
  atlasTexture.needsUpdate = true;
  
  // ============================================================
  // Create ShaderMaterial
  // ============================================================
  
  return new ShaderMaterial({
    vertexShader: TILE_ATLAS_VERTEX,
    fragmentShader: TILE_ATLAS_FRAGMENT,
    uniforms: {
      uAtlas: { value: atlasTexture },
      uTilesPerRow: { value: tilesPerRow },
      uAtlasSize: { value: atlasPixelSize },
      uTilePixelSize: { value: tilePixelSize },
    },
    transparent: true,       // Support alpha in tileset
    depthWrite: true,        // Write to depth buffer
    depthTest: true,         // Test against depth buffer
    side: DoubleSide,        // Visible from below (for elevated tiles)
  });
}

/**
 * Helper to calculate tiles per row from atlas dimensions
 */
export function calculateTilesPerRow(atlasPixelSize: number, tilePixelSize: number): number {
  return Math.floor(atlasPixelSize / tilePixelSize);
}
```

### Files to Modify

#### `src/game/common/tilemap.types.ts`

Add the following interface (keep all existing code):

```typescript
/**
 * Tileset atlas configuration for TileAtlasMaterial
 */
export interface I_TilesetConfig {
  /** Path to the tileset atlas texture (relative to public folder) */
  atlasPath: string;
  /** Size of each tile in the atlas in pixels (e.g., 16, 32) */
  tilePixelSize: number;
  /** Total atlas texture size in pixels (e.g., 256, 512) */
  atlasPixelSize: number;
  /** Number of tile columns in the atlas */
  columns: number;
  /** Number of tile rows in the atlas */
  rows: number;
}
```

#### `src/game/components/rendering/TileChunkMeshComponent.ts`

Modify the component to support tileset material:

**1. Update the config interface:**

```typescript
export interface I_TileChunkMeshConfig {
  /** Chunk X coordinate in chunk space */
  chunkX: number;
  /** Chunk Z coordinate in chunk space */
  chunkZ: number;
  /** World units per tile (default: 1) */
  tileSize?: number;
  /** Tiles per chunk dimension (default: 32) */
  chunkSize?: number;
  /** Initial tile data - 2D array [row][col] */
  tileData?: I_TileData[][];
  /** Layer identifier for multi-layer (default: 'ground') */
  layer?: string;
  /** Whether to show debug wireframe overlay */
  debug?: boolean;
  /** Whether chunk receives shadows */
  receiveShadow?: boolean;
  
  // NEW: Tileset configuration
  /** Tileset configuration - if provided, uses TileAtlasMaterial instead of debug colors */
  tileset?: I_TilesetConfig;
  /** Pre-loaded tileset texture (optional - will load from tileset.atlasPath if not provided) */
  tilesetTexture?: Texture;
}
```

**2. Add imports:**

```typescript
import { TextureLoader, Texture } from "three";
import { createTileAtlasMaterial, calculateTilesPerRow } from "../../materials/TileAtlasMaterial";
import type { I_TilesetConfig } from "../../common/tilemap.types";
```

**3. Add private field:**

```typescript
private material!: MeshBasicMaterial | ShaderMaterial;
```

**4. Modify init() to create appropriate material:**

Replace the material creation section with:

```typescript
async init(context: I_SceneContext): Promise<void> {
  this.context = context;
  this.restrictByTrait(TRAIT.MESH_PROVIDER, "Use only one mesh provider per GameObject");

  const instanceCount = this.chunkSize * this.chunkSize;

  // Create tile plane geometry (pre-rotated to XZ plane)
  const geometry = new PlaneGeometry(this.tileSize, this.tileSize);
  geometry.rotateX(-Math.PI / 2);

  // ============================================================
  // Material Selection: Tileset Atlas or Debug Rainbow
  // ============================================================
  
  if (this.config.tileset) {
    // Load or use provided texture
    let texture: Texture;
    if (this.config.tilesetTexture) {
      texture = this.config.tilesetTexture;
    } else {
      const loader = new TextureLoader();
      texture = await loader.loadAsync(this.config.tileset.atlasPath);
    }
    
    // Create TileAtlasMaterial
    this.material = createTileAtlasMaterial({
      atlasTexture: texture,
      atlasPixelSize: this.config.tileset.atlasPixelSize,
      tilePixelSize: this.config.tileset.tilePixelSize,
      tilesPerRow: this.config.tileset.columns,
    });
  } else {
    // Fallback: Debug rainbow colors
    this.material = new MeshBasicMaterial({
      color: 0xffffff,
    });
  }

  // Create instanced mesh
  this.instancedMesh = new InstancedMesh(geometry, this.material, instanceCount);
  // ... rest of existing init code ...
```

**5. Update the color assignment to only apply for debug mode:**

```typescript
// Set per-instance colors ONLY for debug mode (rainbow palette)
if (!this.config.tileset) {
  this.instancedMesh.instanceColor = new InstancedBufferAttribute(
    new Float32Array(instanceCount * 3), 
    3
  );
  for (let i = 0; i < instanceCount; i++) {
    const color = this.getTileColor(tileIndices[i]);
    this.instancedMesh.setColorAt(i, color);
  }
  this.instancedMesh.instanceColor.needsUpdate = true;
}
```

**6. Update destroy() to dispose material:**

```typescript
destroy(): void {
  if (this.material) {
    this.material.dispose();
  }
  super.destroy(this.context?.scene);
}
```

### Test Criteria

Create a test tileset at `public/tilesets/test-terrain.png`:
- 256x256 pixels
- 16x16 pixel tiles (16 columns × 16 rows = 256 tiles)
- Different colored tiles for easy visual verification
- Some tiles with transparency

**Test Cases:**

- [ ] **TC1.1**: Load tileset and see actual tile sprites instead of rainbow colors
- [ ] **TC1.2**: No texture bleeding between adjacent tiles (check at maximum zoom)
- [ ] **TC1.3**: Transparent pixels in tileset render correctly (discard, not black)
- [ ] **TC1.4**: Colors appear correct (not washed out or oversaturated)
- [ ] **TC1.5**: Fallback to rainbow debug when `tileset` config is undefined
- [ ] **TC1.6**: Different tileIndex values sample different tiles from atlas

---

## Phase 2: Elevation Layer System

**Goal**: Stack tiles at different Y levels for HD-2D depth.

**Duration**: 2 days

### Files to Create

#### `src/game/common/ground.types.ts`

```typescript
/**
 * Ground System Types
 * 
 * Unified configuration for all ground rendering modes:
 * - Procedural: Noise-based terrain generation
 * - Manual: Code-placed tiles for level design
 * - Image: Single large background texture
 */

import type { I_TilesetConfig, I_TileData } from "./tilemap.types";

// ============================================================
// Core Types
// ============================================================

/**
 * Ground rendering mode
 */
export type GroundMode = "procedural" | "manual" | "image";

/**
 * Unified ground configuration
 */
export interface I_GroundConfig {
  /** Rendering mode */
  mode: GroundMode;
  
  /** World units per tile (default: 1) */
  tileSize?: number;
  
  /** Tiles per chunk dimension (default: 32) */
  chunkSize?: number;
  
  /** Tileset configuration (required for procedural/manual modes) */
  tileset?: I_TilesetConfig;
  
  /** Procedural generation config (mode: "procedural") */
  procedural?: I_ProceduralGroundConfig;
  
  /** Manual layer data (mode: "manual") */
  manual?: I_ManualGroundConfig;
  
  /** Single image config (mode: "image") */
  image?: I_ImageGroundConfig;
}

// ============================================================
// Elevation Layer Types
// ============================================================

/**
 * Collision behavior for an elevation layer
 * - "walkable": Player can stand on this layer
 * - "blocked": Solid wall, blocks all movement
 * - "passthrough": No collision (decorative only)
 */
export type LayerCollisionType = "walkable" | "blocked" | "passthrough";

/**
 * Elevation layer definition
 */
export interface I_ElevationLayer {
  /** Unique identifier for this layer */
  id: string;
  
  /** Y position in world units (0 = ground level) */
  elevation: number;
  
  /** Collision behavior */
  collisionType: LayerCollisionType;
  
  /** Collision volume thickness in Y (default: 0.2) */
  thickness?: number;
  
  /** Display name for editor UI */
  displayName?: string;
}

/**
 * A single tile within a layer
 */
export interface I_LayerTile {
  /** Grid X coordinate (tile units, not world units) */
  x: number;
  
  /** Grid Z coordinate (tile units, not world units) */
  z: number;
  
  /** Tile index in tileset atlas */
  tileIndex: number;
}

// ============================================================
// Mode-Specific Configs
// ============================================================

/**
 * Procedural generation configuration
 */
export interface I_ProceduralGroundConfig {
  /** Random seed for reproducible generation */
  seed?: number;
  
  /** Noise scale (larger = smoother terrain) */
  noiseScale?: number;
  
  /** Number of noise octaves */
  octaves?: number;
  
  /** Elevation layer thresholds */
  elevationLayers?: I_ElevationLayerThreshold[];
}

/**
 * Threshold for assigning tiles to elevation layers
 */
export interface I_ElevationLayerThreshold {
  /** Noise value threshold (0-1). Tiles below this go to this layer */
  maxNoiseValue: number;
  
  /** Layer configuration */
  layer: I_ElevationLayer;
}

/**
 * Manual ground configuration (for level design)
 */
export interface I_ManualGroundConfig {
  /** Layer definitions with their tiles */
  layers: I_ManualLayerData[];
}

/**
 * A layer with its tile placements
 */
export interface I_ManualLayerData {
  /** Layer definition */
  layer: I_ElevationLayer;
  
  /** Tiles placed on this layer */
  tiles: I_LayerTile[];
}

/**
 * Single image ground configuration
 */
export interface I_ImageGroundConfig {
  /** Path to background image */
  imagePath: string;
  
  /** Ground width in world units */
  width: number;
  
  /** Ground depth in world units */
  depth: number;
  
  /** Y position (default: 0) */
  elevation?: number;
  
  /** Use NearestFilter for pixel art (default: false) */
  pixelArt?: boolean;
}

// ============================================================
// Defaults
// ============================================================

export const GROUND_DEFAULTS = {
  TILE_SIZE: 1,
  CHUNK_SIZE: 32,
  LAYER_THICKNESS: 0.2,
  DEFAULT_ELEVATION: 0,
} as const;

/**
 * Create a default elevation layer
 */
export function createDefaultLayer(
  id: string,
  elevation: number,
  collisionType: LayerCollisionType = "walkable"
): I_ElevationLayer {
  return {
    id,
    elevation,
    collisionType,
    thickness: GROUND_DEFAULTS.LAYER_THICKNESS,
  };
}

/**
 * Default elevation layers for procedural generation
 */
export const DEFAULT_ELEVATION_LAYERS: I_ElevationLayerThreshold[] = [
  {
    maxNoiseValue: 0.7,
    layer: createDefaultLayer("ground", 0, "walkable"),
  },
  {
    maxNoiseValue: 0.85,
    layer: createDefaultLayer("raised", 0.5, "walkable"),
  },
  {
    maxNoiseValue: 1.0,
    layer: createDefaultLayer("platform", 1.0, "walkable"),
  },
];
```

### Files to Modify

#### `src/game/utils/TileMapGenerator.ts`

Add the following method to the `TileMapGenerator` class:

```typescript
import type { 
  I_ElevationLayerThreshold, 
  I_ElevationLayer,
  DEFAULT_ELEVATION_LAYERS 
} from "../common/ground.types";

// Add to class:

/**
 * Result of layered chunk generation
 */
export interface I_LayeredChunkResult {
  /** Map of layer ID to tile data for that layer */
  layers: Map<string, I_TileData[][]>;
  
  /** Layer definitions in elevation order (lowest first) */
  layerDefs: I_ElevationLayer[];
}

/**
 * Generate chunk data with multiple elevation layers
 * 
 * Uses a separate noise channel for elevation assignment.
 * Tiles are assigned to layers based on elevation noise thresholds.
 * 
 * @param chunkX - Chunk X coordinate
 * @param chunkZ - Chunk Z coordinate
 * @param layerThresholds - Elevation layer configuration
 * @param chunkSize - Tiles per chunk dimension
 * @returns Layered chunk data
 */
generateLayeredChunk(
  chunkX: number,
  chunkZ: number,
  layerThresholds: I_ElevationLayerThreshold[] = DEFAULT_ELEVATION_LAYERS,
  chunkSize: number = TILEMAP_DEFAULTS.CHUNK_SIZE
): I_LayeredChunkResult {
  // Sort thresholds by maxNoiseValue ascending
  const sortedThresholds = [...layerThresholds].sort(
    (a, b) => a.maxNoiseValue - b.maxNoiseValue
  );
  
  // Initialize layer data maps
  const layers = new Map<string, I_TileData[][]>();
  const layerDefs: I_ElevationLayer[] = [];
  
  for (const threshold of sortedThresholds) {
    const emptyGrid: I_TileData[][] = [];
    for (let row = 0; row < chunkSize; row++) {
      emptyGrid[row] = [];
      for (let col = 0; col < chunkSize; col++) {
        // Initialize with "empty" marker (tileIndex -1)
        emptyGrid[row][col] = {
          tileIndex: -1, // -1 means no tile
          height: threshold.layer.elevation,
          collisionType: threshold.layer.collisionType === "passthrough" 
            ? "walkable" 
            : threshold.layer.collisionType,
        };
      }
    }
    layers.set(threshold.layer.id, emptyGrid);
    layerDefs.push(threshold.layer);
  }
  
  // Generate tiles and assign to layers
  for (let row = 0; row < chunkSize; row++) {
    for (let col = 0; col < chunkSize; col++) {
      // World coordinates for noise sampling
      const worldX = chunkX * chunkSize + col;
      const worldZ = chunkZ * chunkSize + row;
      
      // Sample terrain noise (for tile type)
      const terrainNoise = fbm(
        worldX * this.noiseScale,
        worldZ * this.noiseScale,
        this.octaves,
        this.seed
      );
      
      // Sample elevation noise (separate channel, different seed)
      const elevationNoise = fbm(
        worldX * this.noiseScale * 0.5, // Lower frequency for elevation
        worldZ * this.noiseScale * 0.5,
        this.octaves,
        this.seed + 5000 // Different seed
      );
      
      // Determine which layer this tile belongs to
      let targetLayer: I_ElevationLayer | null = null;
      for (const threshold of sortedThresholds) {
        if (elevationNoise <= threshold.maxNoiseValue) {
          targetLayer = threshold.layer;
          break;
        }
      }
      
      // Fallback to last layer if somehow none matched
      if (!targetLayer) {
        targetLayer = sortedThresholds[sortedThresholds.length - 1].layer;
      }
      
      // Get tile index from terrain noise
      const terrain = this.getTerrainFromNoise(terrainNoise);
      const tileIndex = this.useAutoTiling
        ? this.calculateAutoTileIndex(worldX, worldZ, terrain)
        : this.getBaseTileIndex(terrain);
      
      // Place tile in its layer
      const layerData = layers.get(targetLayer.id)!;
      layerData[row][col] = {
        tileIndex,
        height: targetLayer.elevation,
        collisionType: targetLayer.collisionType === "passthrough" 
          ? "walkable" 
          : targetLayer.collisionType,
      };
    }
  }
  
  return { layers, layerDefs };
}

/**
 * Helper to calculate auto-tile index at world position
 */
private calculateAutoTileIndex(worldX: number, worldZ: number, terrain: TerrainType): number {
  // For now, use simple terrain-to-index mapping
  // Full auto-tiling would require neighbor sampling across chunk boundaries
  return this.getBaseTileIndex(terrain);
}

/**
 * Get base tile index for a terrain type (no auto-tiling)
 */
private getBaseTileIndex(terrain: TerrainType): number {
  const terrainBaseIndex: Record<TerrainType, number> = {
    grass: 0,
    dirt: 16,
    water: 32,
    stone: 48,
    sand: 64,
  };
  return terrainBaseIndex[terrain] ?? 0;
}
```

#### `src/game/modules/scene/TileMapModule.ts`

Modify to support multiple layers per chunk coordinate:

**1. Update tracking structure:**

```typescript
// Replace:
private activeChunks: Map<string, TileChunk> = new Map();

// With:
/** Map of chunkKey → (layerId → TileChunk) */
private activeChunks: Map<string, Map<string, TileChunk>> = new Map();

/** Current layer configuration */
private layerDefs: I_ElevationLayer[] = [];
```

**2. Add imports:**

```typescript
import type { 
  I_ElevationLayer, 
  I_ElevationLayerThreshold,
  DEFAULT_ELEVATION_LAYERS 
} from "../../common/ground.types";
```

**3. Update config interface:**

```typescript
export interface I_TileMapModuleConfig {
  // ... existing fields ...
  
  /** Enable layered generation (default: false for backward compatibility) */
  enableLayers?: boolean;
  
  /** Elevation layer configuration (if enableLayers is true) */
  elevationLayers?: I_ElevationLayerThreshold[];
  
  /** Tileset configuration (required for actual rendering) */
  tileset?: I_TilesetConfig;
}
```

**4. Modify loadChunk():**

```typescript
private loadChunk(chunkX: number, chunkZ: number): void {
  const key = this.chunkManager.getChunkKey(chunkX, chunkZ);

  if (this.activeChunks.has(key)) {
    return; // Already loaded
  }

  const chunkLayers = new Map<string, TileChunk>();

  if (this.config.enableLayers) {
    // Generate layered chunk data
    const { layers, layerDefs } = this.generator.generateLayeredChunk(
      chunkX,
      chunkZ,
      this.config.elevationLayers ?? DEFAULT_ELEVATION_LAYERS,
      this.config.chunkSize
    );
    
    this.layerDefs = layerDefs;

    // Create a TileChunk for each layer
    for (const [layerId, tileData] of layers) {
      const layerDef = layerDefs.find(l => l.id === layerId);
      if (!layerDef) continue;

      // Skip layers with no tiles (all tileIndex === -1)
      const hasTiles = tileData.some(row => 
        row.some(tile => tile.tileIndex >= 0)
      );
      if (!hasTiles) continue;

      const chunk = this.chunkPool.acquire({
        chunkX,
        chunkZ,
        tileSize: this.config.tileSize,
        chunkSize: this.config.chunkSize,
        tileData,
        layer: layerId,
        tileset: this.config.tileset,
        // Position this layer at its elevation
        yOffset: layerDef.elevation,
      });

      this.context.getService("gameObjectsManager").register(chunk);
      chunkLayers.set(layerId, chunk);
    }
  } else {
    // Single-layer generation (backward compatible)
    const chunkData = this.generator.generateChunk(
      chunkX,
      chunkZ,
      this.config.chunkSize
    );

    const chunk = this.chunkPool.acquire({
      chunkX,
      chunkZ,
      tileSize: this.config.tileSize,
      chunkSize: this.config.chunkSize,
      tileData: chunkData.tiles,
      tileset: this.config.tileset,
    });

    this.context.getService("gameObjectsManager").register(chunk);
    chunkLayers.set("ground", chunk);
  }

  this.activeChunks.set(key, chunkLayers);

  if (this.config.debug) {
    console.log(`[TileMapModule] Loaded chunk (${chunkX}, ${chunkZ}) with ${chunkLayers.size} layers`);
  }
}
```

**5. Update unloadChunk():**

```typescript
private unloadChunk(chunkX: number, chunkZ: number): void {
  const key = this.chunkManager.getChunkKey(chunkX, chunkZ);
  const chunkLayers = this.activeChunks.get(key);

  if (!chunkLayers) {
    return;
  }

  // Unload all layers for this chunk
  for (const [layerId, chunk] of chunkLayers) {
    this.context.getService("gameObjectsManager").unregister(chunk.id);
    this.chunkPool.release(chunk);
  }

  this.activeChunks.delete(key);

  if (this.config.debug) {
    console.log(`[TileMapModule] Unloaded chunk (${chunkX}, ${chunkZ})`);
  }
}
```

**6. Update frustum culling:**

```typescript
private updateFrustumCulling(): void {
  if (!this.camera?.instance) return;

  const cam = this.camera.instance;
  cam.updateMatrixWorld();
  this.projMatrix.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
  this.frustum.setFromProjectionMatrix(this.projMatrix);

  let visible = 0;
  let hidden = 0;

  // Cull all chunks across all layers
  for (const chunkLayers of this.activeChunks.values()) {
    for (const chunk of chunkLayers.values()) {
      const bounds = chunk.getBoundingBox();
      const isVisible = this.frustum.intersectsBox(bounds);
      chunk.setVisible(isVisible);

      if (isVisible) visible++;
      else hidden++;
    }
  }

  if (this.config.debug && Math.random() < 0.01) {
    console.log(`[TileMapModule] Frustum: ${visible} visible, ${hidden} hidden`);
  }
}
```

#### `src/game/components/rendering/TileChunkMeshComponent.ts`

Add support for Y offset:

```typescript
export interface I_TileChunkMeshConfig {
  // ... existing fields ...
  
  /** Y position offset for this layer (default: 0) */
  yOffset?: number;
}

// In init(), update the world position calculation:
const worldY = tile.height + (this.config.yOffset ?? 0) + 0.02;
```

### Test Criteria

- [ ] **TC2.1**: Generate terrain with 2 elevation layers visible at different Y heights
- [ ] **TC2.2**: Generate terrain with 3 layers (ground, raised, platform)
- [ ] **TC2.3**: Camera looking down shows correct depth ordering (higher layers in front)
- [ ] **TC2.4**: Each layer is independently frustum-culled
- [ ] **TC2.5**: Backward compatible: `enableLayers: false` works as before
- [ ] **TC2.6**: Empty layers (no tiles) don't create TileChunk objects

---

## Phase 3: 3D Collision Volumes

**Goal**: Player can walk ON elevated platforms and UNDER bridges.

**Duration**: 1-2 days

### Files to Create

#### `src/game/components/ground/GroundCollisionComponent.ts`

```typescript
/**
 * GroundCollisionComponent
 * 
 * Creates 3D collision volumes for elevation layers.
 * Uses flood-fill algorithm to merge adjacent tiles into larger boxes.
 * Supports walking ON and UNDER platforms.
 */

import { I_SceneContext } from "@/game/common/scenes.types";
import { ComponentPriority, GameComponent } from "@/game/GameComponent";
import { PhysicsSystem } from "@/game/systems/physics/PhysicsSystem";
import type { I_ElevationLayer } from "@/game/common/ground.types";
import type { I_TileData } from "@/game/common/tilemap.types";

/**
 * Merged collision volume
 */
interface I_CollisionVolume {
  /** Center X in world units */
  centerX: number;
  /** Center Z in world units */
  centerZ: number;
  /** Width in world units (X extent) */
  width: number;
  /** Depth in world units (Z extent) */
  depth: number;
}

/**
 * Configuration for GroundCollisionComponent
 */
export interface I_GroundCollisionConfig {
  /** Chunk X coordinate */
  chunkX: number;
  /** Chunk Z coordinate */
  chunkZ: number;
  /** Tile size in world units */
  tileSize: number;
  /** Chunk size in tiles */
  chunkSize: number;
  /** Layer definitions */
  layers: I_ElevationLayer[];
  /** Tile data per layer (layerId → 2D tile array) */
  tileData: Map<string, I_TileData[][]>;
}

export class GroundCollisionComponent extends GameComponent {
  public readonly priority = ComponentPriority.PHYSICS;

  /** Map of layerId → array of registered collider IDs */
  private layerColliders: Map<string, string[]> = new Map();
  
  private config: I_GroundCollisionConfig;
  private physics!: PhysicsSystem;

  constructor(config: I_GroundCollisionConfig) {
    super();
    this.config = config;
  }

  async init(context: I_SceneContext): Promise<void> {
    this.physics = context.getService("physics") as PhysicsSystem;

    for (const layer of this.config.layers) {
      // Skip passthrough layers (no collision)
      if (layer.collisionType === "passthrough") continue;

      const tiles = this.config.tileData.get(layer.id);
      if (!tiles) continue;

      // Merge tiles into larger collision volumes
      const volumes = this.mergeToVolumes(tiles, layer);
      const colliderIds: string[] = [];

      const thickness = layer.thickness ?? 0.2;

      for (let i = 0; i < volumes.length; i++) {
        const vol = volumes[i];
        const id = `ground_${this.config.chunkX}_${this.config.chunkZ}_${layer.id}_${i}`;

        this.physics.registerStatic(id, {
          shape: {
            type: "cuboid",
            width: vol.width,
            height: thickness,
            depth: vol.depth,
          },
          position: [
            vol.centerX,
            layer.elevation + thickness / 2, // Center of volume
            vol.centerZ,
          ],
        });

        colliderIds.push(id);

        // Register for cleanup
        this.cleanup.registerCallback(() => {
          this.physics.remove(id);
        });
      }

      this.layerColliders.set(layer.id, colliderIds);
    }
  }

  /**
   * Flood-fill algorithm to merge adjacent tiles into larger collision volumes
   */
  private mergeToVolumes(tiles: I_TileData[][], layer: I_ElevationLayer): I_CollisionVolume[] {
    const { chunkSize, tileSize, chunkX, chunkZ } = this.config;
    const volumes: I_CollisionVolume[] = [];

    // Create visited grid
    const visited: boolean[][] = [];
    for (let row = 0; row < chunkSize; row++) {
      visited[row] = new Array(chunkSize).fill(false);
    }

    // Find connected regions and compute bounding boxes
    for (let row = 0; row < chunkSize; row++) {
      for (let col = 0; col < chunkSize; col++) {
        // Skip if already visited or empty tile
        if (visited[row][col]) continue;
        if (tiles[row][col].tileIndex < 0) continue;
        if (tiles[row][col].collisionType === "trigger") continue; // Triggers don't block

        // Flood-fill to find connected region
        const region = this.floodFill(tiles, visited, row, col, chunkSize);
        
        if (region.length === 0) continue;

        // Compute bounding box
        let minRow = Infinity, maxRow = -Infinity;
        let minCol = Infinity, maxCol = -Infinity;

        for (const [r, c] of region) {
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }

        // Convert to world coordinates
        const chunkWorldX = chunkX * chunkSize * tileSize;
        const chunkWorldZ = chunkZ * chunkSize * tileSize;

        const width = (maxCol - minCol + 1) * tileSize;
        const depth = (maxRow - minRow + 1) * tileSize;
        const centerX = chunkWorldX + (minCol + (maxCol - minCol + 1) / 2) * tileSize;
        const centerZ = chunkWorldZ + (minRow + (maxRow - minRow + 1) / 2) * tileSize;

        volumes.push({ centerX, centerZ, width, depth });
      }
    }

    return volumes;
  }

  /**
   * Flood-fill from a starting cell, returns list of [row, col] pairs
   */
  private floodFill(
    tiles: I_TileData[][],
    visited: boolean[][],
    startRow: number,
    startCol: number,
    chunkSize: number
  ): Array<[number, number]> {
    const region: Array<[number, number]> = [];
    const stack: Array<[number, number]> = [[startRow, startCol]];

    while (stack.length > 0) {
      const [row, col] = stack.pop()!;

      // Bounds check
      if (row < 0 || row >= chunkSize || col < 0 || col >= chunkSize) continue;
      // Already visited
      if (visited[row][col]) continue;
      // Empty tile
      if (tiles[row][col].tileIndex < 0) continue;
      // Non-blocking tile
      if (tiles[row][col].collisionType === "trigger") continue;

      // Mark visited and add to region
      visited[row][col] = true;
      region.push([row, col]);

      // Add neighbors (4-connected)
      stack.push([row - 1, col]); // North
      stack.push([row + 1, col]); // South
      stack.push([row, col - 1]); // West
      stack.push([row, col + 1]); // East
    }

    return region;
  }

  /**
   * Get all collider IDs for a specific layer
   */
  getLayerColliderIds(layerId: string): string[] {
    return this.layerColliders.get(layerId) ?? [];
  }

  /**
   * Get total number of collision volumes created
   */
  getTotalVolumeCount(): number {
    let count = 0;
    for (const ids of this.layerColliders.values()) {
      count += ids.length;
    }
    return count;
  }

  destroy(): void {
    // Cleanup handled by registered callbacks
    super.destroy();
  }
}
```

### Files to Modify

#### `src/game/prefabs/environment/TileChunk.ts` (or create if doesn't exist)

Add GroundCollisionComponent to the TileChunk prefab when layers are enabled:

```typescript
import { GroundCollisionComponent } from "@/game/components/ground/GroundCollisionComponent";

// In TileChunk constructor or factory:
if (config.enableCollision && config.layers && config.tileData) {
  this.addComponent(new GroundCollisionComponent({
    chunkX: config.chunkX,
    chunkZ: config.chunkZ,
    tileSize: config.tileSize,
    chunkSize: config.chunkSize,
    layers: config.layers,
    tileData: config.tileData,
  }));
}
```

### Test Criteria

- [ ] **TC3.1**: Player stands ON a platform at Y=1.0
- [ ] **TC3.2**: Player walks UNDER a bridge at Y=1.0 when standing at Y=0
- [ ] **TC3.3**: Enable `showPhysicsDebug` → wireframes show correct merged volumes
- [ ] **TC3.4**: No collision gaps between adjacent tiles in same region
- [ ] **TC3.5**: `passthrough` layers create no collision volumes
- [ ] **TC3.6**: Volume merging reduces total collider count (verify in debug)
- [ ] **TC3.7**: Cleanup removes all collision volumes when chunk unloads

---

## Phase 4: Mode Unification (GroundModule)

**Goal**: Single `I_GroundConfig` drives all three rendering modes.

**Duration**: 1 day

### Files to Create

#### `src/game/modules/scene/GroundModule.ts`

```typescript
/**
 * GroundModule - Unified ground rendering system
 * 
 * Supports three modes:
 * - procedural: Noise-based terrain with tileset atlas
 * - manual: Code-placed tiles for level design
 * - image: Single large background texture
 * 
 * This is the primary public API for ground rendering.
 * TileMapModule is now internal implementation detail.
 */

import type { I_SceneContext, I_SceneModule } from "@/game/common/scenes.types";
import SceneModule from "@/game/modules/SceneModule";
import { TileMapModule, type I_TileMapModuleConfig } from "./TileMapModule";
import { ImageGroundRenderer } from "../../components/ground/ImageGroundRenderer";
import type {
  I_GroundConfig,
  I_ManualLayerData,
  I_ElevationLayer,
  I_LayerTile,
  GroundMode,
} from "../../common/ground.types";
import type { I_TileData } from "../../common/tilemap.types";

export class GroundModule extends SceneModule implements I_SceneModule {
  private mode: GroundMode;
  private config: I_GroundConfig;
  
  // Renderer instances (only one is active based on mode)
  private tileMapModule: TileMapModule | null = null;
  private imageRenderer: ImageGroundRenderer | null = null;
  
  // Manual mode state
  private manualLayers: Map<string, Map<string, I_TileData>> = new Map();

  constructor(config: I_GroundConfig) {
    super("ground");
    this.config = config;
    this.mode = config.mode;
  }

  protected async init(context: I_SceneContext): Promise<void> {
    switch (this.mode) {
      case "procedural":
        await this.initProceduralMode(context);
        break;

      case "manual":
        await this.initManualMode(context);
        break;

      case "image":
        await this.initImageMode(context);
        break;

      default:
        throw new Error(`[GroundModule] Unknown mode: ${this.mode}`);
    }
  }

  // ============================================================
  // Mode Initialization
  // ============================================================

  private async initProceduralMode(context: I_SceneContext): Promise<void> {
    const tileMapConfig: I_TileMapModuleConfig = {
      tileSize: this.config.tileSize,
      chunkSize: this.config.chunkSize,
      tileset: this.config.tileset,
      enableLayers: true,
      elevationLayers: this.config.procedural?.elevationLayers,
      generatorConfig: {
        seed: this.config.procedural?.seed,
        noiseScale: this.config.procedural?.noiseScale,
        octaves: this.config.procedural?.octaves,
      },
    };

    this.tileMapModule = new TileMapModule(tileMapConfig);
    await this.tileMapModule.start(context);
  }

  private async initManualMode(context: I_SceneContext): Promise<void> {
    if (!this.config.manual) {
      throw new Error("[GroundModule] Manual mode requires 'manual' config");
    }

    // Convert manual layer data to internal format
    for (const layerData of this.config.manual.layers) {
      const layerTiles = new Map<string, I_TileData>();
      
      for (const tile of layerData.tiles) {
        const key = `${tile.x},${tile.z}`;
        layerTiles.set(key, {
          tileIndex: tile.tileIndex,
          height: layerData.layer.elevation,
          collisionType: layerData.layer.collisionType === "passthrough" 
            ? "walkable" 
            : layerData.layer.collisionType,
        });
      }
      
      this.manualLayers.set(layerData.layer.id, layerTiles);
    }

    // Use TileMapModule with static data
    // TODO: Implement static data loading in TileMapModule
    console.log("[GroundModule] Manual mode initialized with", this.manualLayers.size, "layers");
  }

  private async initImageMode(context: I_SceneContext): Promise<void> {
    if (!this.config.image) {
      throw new Error("[GroundModule] Image mode requires 'image' config");
    }

    this.imageRenderer = new ImageGroundRenderer(this.config.image);
    await this.imageRenderer.init(context);
  }

  // ============================================================
  // Public API
  // ============================================================

  /**
   * Update player position (for procedural chunk loading)
   */
  setPlayerPosition(x: number, z: number): void {
    if (this.tileMapModule) {
      this.tileMapModule.setPlayerPosition(x, z);
    }
  }

  /**
   * Set a single tile (manual mode only)
   */
  setTile(x: number, z: number, layerId: string, tileIndex: number): void {
    if (this.mode !== "manual") {
      console.warn("[GroundModule] setTile() only works in manual mode");
      return;
    }

    let layer = this.manualLayers.get(layerId);
    if (!layer) {
      layer = new Map();
      this.manualLayers.set(layerId, layer);
    }

    const key = `${x},${z}`;
    const existing = layer.get(key);
    
    layer.set(key, {
      tileIndex,
      height: existing?.height ?? 0,
      collisionType: existing?.collisionType ?? "walkable",
    });

    // TODO: Mark dirty for rebuild
    this.markDirty();
  }

  /**
   * Remove a tile (manual mode only)
   */
  removeTile(x: number, z: number, layerId: string): void {
    if (this.mode !== "manual") {
      console.warn("[GroundModule] removeTile() only works in manual mode");
      return;
    }

    const layer = this.manualLayers.get(layerId);
    if (layer) {
      layer.delete(`${x},${z}`);
      this.markDirty();
    }
  }

  /**
   * Get a tile (manual mode only)
   */
  getTile(x: number, z: number, layerId: string): I_TileData | null {
    const layer = this.manualLayers.get(layerId);
    return layer?.get(`${x},${z}`) ?? null;
  }

  /**
   * Add a new layer (manual mode only)
   */
  addLayer(layer: I_ElevationLayer): void {
    if (this.mode !== "manual") {
      console.warn("[GroundModule] addLayer() only works in manual mode");
      return;
    }

    if (!this.manualLayers.has(layer.id)) {
      this.manualLayers.set(layer.id, new Map());
    }
  }

  /**
   * Get all layer IDs
   */
  getLayerIds(): string[] {
    if (this.mode === "manual") {
      return Array.from(this.manualLayers.keys());
    }
    // TODO: Get from TileMapModule for procedural mode
    return [];
  }

  /**
   * Get current mode
   */
  getMode(): GroundMode {
    return this.mode;
  }

  // ============================================================
  // Internal
  // ============================================================

  private isDirty = false;

  private markDirty(): void {
    if (!this.isDirty) {
      this.isDirty = true;
      // Debounce rebuild to next frame
      requestAnimationFrame(() => this.rebuild());
    }
  }

  private rebuild(): void {
    if (!this.isDirty) return;
    this.isDirty = false;
    
    // TODO: Rebuild mesh and collision from manualLayers
    console.log("[GroundModule] Rebuilding manual layers...");
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  public update(delta: number): void {
    this.tileMapModule?.update(delta);
  }

  async destroy(): Promise<void> {
    await this.tileMapModule?.destroy();
    this.imageRenderer?.destroy();
    this.manualLayers.clear();
  }
}
```

#### `src/game/components/ground/ImageGroundRenderer.ts`

```typescript
/**
 * ImageGroundRenderer
 * 
 * Simple ground plane with a single large texture.
 * Used for "image" mode when a hand-painted background is preferred.
 */

import {
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  TextureLoader,
  NearestFilter,
  LinearFilter,
  SRGBColorSpace,
  DoubleSide,
} from "three";
import type { I_SceneContext } from "@/game/common/scenes.types";
import type { I_ImageGroundConfig } from "@/game/common/ground.types";
import { PhysicsSystem } from "@/game/systems/physics/PhysicsSystem";

export class ImageGroundRenderer {
  private mesh: Mesh | null = null;
  private material: MeshBasicMaterial | null = null;
  private collisionId: string | null = null;
  private context: I_SceneContext | null = null;

  constructor(private config: I_ImageGroundConfig) {}

  async init(context: I_SceneContext): Promise<void> {
    this.context = context;

    // Load texture
    const loader = new TextureLoader();
    const texture = await loader.loadAsync(this.config.imagePath);

    // Configure texture based on pixel art preference
    if (this.config.pixelArt) {
      texture.magFilter = NearestFilter;
      texture.minFilter = NearestFilter;
      texture.generateMipmaps = false;
    } else {
      texture.magFilter = LinearFilter;
      texture.minFilter = LinearFilter;
    }
    texture.colorSpace = SRGBColorSpace;

    // Create geometry
    const geometry = new PlaneGeometry(this.config.width, this.config.depth);
    geometry.rotateX(-Math.PI / 2); // Make horizontal

    // Create material
    this.material = new MeshBasicMaterial({
      map: texture,
      side: DoubleSide,
    });

    // Create mesh
    this.mesh = new Mesh(geometry, this.material);
    this.mesh.name = "image_ground";
    this.mesh.position.y = this.config.elevation ?? 0;
    this.mesh.receiveShadow = true;

    context.scene.add(this.mesh);

    // Create collision volume
    const physics = context.getService("physics") as PhysicsSystem;
    this.collisionId = "image_ground_collision";
    
    physics.registerStatic(this.collisionId, {
      shape: {
        type: "cuboid",
        width: this.config.width,
        height: 0.2,
        depth: this.config.depth,
      },
      position: [0, (this.config.elevation ?? 0) - 0.1, 0],
    });
  }

  destroy(): void {
    if (this.mesh && this.context) {
      this.context.scene.remove(this.mesh);
      this.mesh.geometry.dispose();
    }
    
    if (this.material) {
      this.material.dispose();
    }

    if (this.collisionId && this.context) {
      const physics = this.context.getService("physics") as PhysicsSystem;
      physics.remove(this.collisionId);
    }
  }
}
```

### Files to Modify

#### `src/game/modules/scene/TileMapModule.ts`

Add JSDoc marking it as internal:

```typescript
/**
 * TileMapModule - Internal tile chunk lifecycle manager
 * 
 * @internal Use GroundModule as the public API
 * 
 * Responsibilities:
 * - Spawns/despawns chunks based on player position
 * - Frustum culling
 * - Chunk pooling
 * - Procedural generation
 */
```

### Test Criteria

- [ ] **TC4.1**: `mode: "procedural"` generates layered terrain with tileset
- [ ] **TC4.2**: `mode: "manual"` creates ground from static layer data
- [ ] **TC4.3**: `mode: "image"` shows single large texture
- [ ] **TC4.4**: `setPlayerPosition()` works in procedural mode
- [ ] **TC4.5**: `setTile()` logs warning in non-manual modes
- [ ] **TC4.6**: Image mode creates collision volume
- [ ] **TC4.7**: Image mode with `pixelArt: true` uses NearestFilter

---

## Phase 5: Manual Tiling API

**Goal**: Runtime tile placement for level design tools.

**Duration**: 1 day

### Files to Modify

#### `src/game/modules/scene/GroundModule.ts`

Add the following methods to the existing GroundModule class:

```typescript
// ============================================================
// Batch Operations (for level editors)
// ============================================================

/**
 * Set multiple tiles at once (more efficient than individual setTile calls)
 */
setTiles(tiles: Array<{ x: number; z: number; layerId: string; tileIndex: number }>): void {
  if (this.mode !== "manual") {
    console.warn("[GroundModule] setTiles() only works in manual mode");
    return;
  }

  for (const tile of tiles) {
    let layer = this.manualLayers.get(tile.layerId);
    if (!layer) {
      layer = new Map();
      this.manualLayers.set(tile.layerId, layer);
    }

    const key = `${tile.x},${tile.z}`;
    const existing = layer.get(key);
    
    layer.set(key, {
      tileIndex: tile.tileIndex,
      height: existing?.height ?? 0,
      collisionType: existing?.collisionType ?? "walkable",
    });
  }

  // Single rebuild for all changes
  this.markDirty();
}

/**
 * Remove multiple tiles at once
 */
removeTiles(tiles: Array<{ x: number; z: number; layerId: string }>): void {
  if (this.mode !== "manual") {
    console.warn("[GroundModule] removeTiles() only works in manual mode");
    return;
  }

  for (const tile of tiles) {
    const layer = this.manualLayers.get(tile.layerId);
    if (layer) {
      layer.delete(`${tile.x},${tile.z}`);
    }
  }

  this.markDirty();
}

/**
 * Clear all tiles from a layer
 */
clearLayer(layerId: string): void {
  if (this.mode !== "manual") {
    console.warn("[GroundModule] clearLayer() only works in manual mode");
    return;
  }

  const layer = this.manualLayers.get(layerId);
  if (layer) {
    layer.clear();
    this.markDirty();
  }
}

/**
 * Remove a layer entirely
 */
removeLayer(layerId: string): void {
  if (this.mode !== "manual") {
    console.warn("[GroundModule] removeLayer() only works in manual mode");
    return;
  }

  this.manualLayers.delete(layerId);
  this.markDirty();
}

/**
 * Get all tiles in a layer
 */
getLayerTiles(layerId: string): I_LayerTile[] {
  const layer = this.manualLayers.get(layerId);
  if (!layer) return [];

  const tiles: I_LayerTile[] = [];
  for (const [key, data] of layer) {
    const [x, z] = key.split(",").map(Number);
    tiles.push({ x, z, tileIndex: data.tileIndex });
  }
  return tiles;
}

/**
 * Export all manual layer data (for saving)
 */
exportManualData(): I_ManualLayerData[] {
  const result: I_ManualLayerData[] = [];
  
  for (const [layerId, tiles] of this.manualLayers) {
    result.push({
      layer: {
        id: layerId,
        elevation: 0, // TODO: Track layer elevations
        collisionType: "walkable",
      },
      tiles: this.getLayerTiles(layerId),
    });
  }
  
  return result;
}

/**
 * Import manual layer data (for loading)
 */
importManualData(data: I_ManualLayerData[]): void {
  if (this.mode !== "manual") {
    console.warn("[GroundModule] importManualData() only works in manual mode");
    return;
  }

  // Clear existing data
  this.manualLayers.clear();

  // Import new data
  for (const layerData of data) {
    const layerTiles = new Map<string, I_TileData>();
    
    for (const tile of layerData.tiles) {
      const key = `${tile.x},${tile.z}`;
      layerTiles.set(key, {
        tileIndex: tile.tileIndex,
        height: layerData.layer.elevation,
        collisionType: layerData.layer.collisionType === "passthrough" 
          ? "walkable" 
          : layerData.layer.collisionType,
      });
    }
    
    this.manualLayers.set(layerData.layer.id, layerTiles);
  }

  this.markDirty();
}

/**
 * Get tile count for debugging
 */
getTileCount(): { total: number; byLayer: Record<string, number> } {
  let total = 0;
  const byLayer: Record<string, number> = {};
  
  for (const [layerId, tiles] of this.manualLayers) {
    byLayer[layerId] = tiles.size;
    total += tiles.size;
  }
  
  return { total, byLayer };
}
```

### Test Criteria

- [ ] **TC5.1**: `setTile()` → tile appears on next frame
- [ ] **TC5.2**: `removeTile()` → tile disappears on next frame
- [ ] **TC5.3**: `setTiles()` with 100 tiles → single rebuild, not 100 rebuilds
- [ ] **TC5.4**: `clearLayer()` removes all tiles from layer
- [ ] **TC5.5**: `exportManualData()` returns correct structure
- [ ] **TC5.6**: `importManualData()` restores saved data correctly
- [ ] **TC5.7**: Collision updates after tile changes

---

## File Structure (Final)

```
src/game/
├── common/
│   ├── ground.types.ts              # NEW: Unified ground config types
│   ├── tilemap.types.ts             # MODIFIED: Added I_TilesetConfig
│   └── autotile.types.ts            # UNCHANGED
│
├── shaders/
│   └── TileAtlasShader.ts           # NEW: GLSL shaders for atlas sampling
│
├── materials/
│   └── TileAtlasMaterial.ts         # NEW: ShaderMaterial factory
│
├── components/
│   ├── ground/                      # NEW FOLDER
│   │   ├── GroundCollisionComponent.ts   # NEW: 3D collision volumes
│   │   └── ImageGroundRenderer.ts        # NEW: Single image renderer
│   └── rendering/
│       └── TileChunkMeshComponent.ts     # MODIFIED: Added tileset support
│
├── modules/
│   └── scene/
│       ├── GroundModule.ts          # NEW: Unified public API
│       └── TileMapModule.ts         # MODIFIED: Internal, multi-layer support
│
├── prefabs/
│   ├── Ground.ts                    # UNCHANGED: Simple fallback
│   └── environment/
│       └── TileChunk.ts             # MODIFIED: Added collision component
│
└── utils/
    ├── TileMapGenerator.ts          # MODIFIED: Added generateLayeredChunk
    ├── AutoTiler.ts                 # UNCHANGED
    ├── ChunkManager.ts              # UNCHANGED
    └── ChunkPool.ts                 # UNCHANGED
```

---

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Draw calls (ground) | ≤ 5 per chunk | Chrome DevTools → Rendering |
| Triangles (ground) | < 50k total | `renderer.info.render.triangles` |
| Texture memory | < 32MB | `renderer.info.memory.textures` |
| Geometry updates | 0 per frame | No BufferAttribute updates |
| Collision volumes | ≤ 20 per chunk | `GroundCollisionComponent.getTotalVolumeCount()` |
| Chunk load time | < 16ms | Performance.now() around loadChunk |

---

## Critical Implementation Notes

### 1. Texture Configuration is Non-Negotiable

```typescript
// ALL FOUR of these are required for pixel art:
texture.magFilter = NearestFilter;      // Sharp pixels
texture.minFilter = NearestFilter;      // Sharp at distance
texture.generateMipmaps = false;        // Prevent mip bleeding
texture.colorSpace = SRGBColorSpace;    // Correct colors

// Missing ANY causes artifacts:
// - Wrong filter → blurry tiles
// - Mipmaps enabled → bleeding at edges
// - Wrong colorSpace → washed out colors
```

### 2. Half-Texel Inset Formula

```glsl
// This prevents sampling at texel boundaries which causes bleeding
float halfTexel = 0.5 / atlasPixelSize;
vec2 insetUV = uv * (1.0 - 2.0 * halfTexel / tileSizeNorm) + halfTexel / tileSizeNorm;
```

### 3. Don't Chunk Small Maps

For matches under 100×100 tiles (10,000 total), a single merged geometry is simpler and faster than chunking. Reserve chunking for open-world exploration.

### 4. Collision Volume Merging

The flood-fill algorithm reduces collider count dramatically:
- 32×32 flat ground = 1 collider (not 1,024)
- Complex terrain ≈ 5-20 colliders per layer

### 5. Layer Ordering

Elevation layers must be processed lowest-to-highest for correct depth sorting. The layerDefs array is pre-sorted in TileMapGenerator.

### 6. CleanupRegistry Integration

All components already use CleanupRegistry. Collision IDs are registered for cleanup via:
```typescript
this.cleanup.registerCallback(() => {
  this.physics.remove(id);
});
```

---

## Dependency Graph

```
Phase 1 (TileAtlas Material)
    │
    ▼
Phase 2 (Elevation Layers) ───────┐
    │                             │
    ▼                             ▼
Phase 3 (3D Collision)      [Can start parallel
    │                        with Phase 2 if needed]
    ▼
Phase 4 (Mode Unification)
    │
    ▼
Phase 5 (Manual API)
```

---

## Implementation Schedule

| Day | Phase | Focus | Deliverable |
|-----|-------|-------|-------------|
| 1 | 1 | TileAtlasShader.ts, TileAtlasMaterial.ts | Shaders compile, material factory works |
| 2 | 1 | TileChunkMeshComponent integration | Tileset renders correctly |
| 3 | 2 | ground.types.ts, generateLayeredChunk | Types defined, generator works |
| 4 | 2 | TileMapModule multi-layer support | Multiple layers render at different Y |
| 5 | 3 | GroundCollisionComponent | Collision volumes created |
| 6 | 3-4 | Testing + GroundModule shell | Walk on/under platforms |
| 7 | 4-5 | Mode unification + Manual API | All modes work, API complete |
| 8 | Buffer | Bug fixes, performance tuning | Ready for review |

---

## Questions for Architect Review

1. Should manual mode support undo/redo for editor use?
2. Do we need layer visibility toggles for editor?
3. Should procedural mode support biome-based tileset switching?
4. Do bridges need special "walkable from below" collision type?
5. Should we add LOD for distant chunks (simpler geometry)?

---

## Approval Checklist

- [ ] Architecture review complete
- [ ] Type interfaces approved
- [ ] Shader approach validated
- [ ] Performance targets agreed
- [ ] Test criteria sufficient
- [ ] Dependencies identified
- [ ] Schedule realistic

---

*Document Version: 1.0*
*Last Updated: [Current Date]*
*Author: Architecture Team*