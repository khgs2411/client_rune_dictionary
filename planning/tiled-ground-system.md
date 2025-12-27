# Implementing 2D-HD Tiled Ground Systems in Three.js

**The authentic HD-2D aesthetic relies on actual 3D geometry for terrain, not billboard trickery.** According to Acquire developer interviews about Octopath Traveler, "backgrounds are almost entirely rendered in 3D"—only characters are 2D sprites billboarded to face the camera. This means your approach of using PlaneGeometry with sprite textures is architecturally correct. The key implementation decisions revolve around UV mapping strategies for tileset atlases, whether to use many individual tile meshes vs. batched rendering, and how to encode verticality data.

## Three approaches to tile rendering compared

**Single Large Plane with Shader Atlas Sampling** works best for static, pre-authored tilemaps. A fragment shader samples the correct tile from an atlas based on a tile index data texture:

```javascript
// Store tile indices in a DataTexture
const tileData = new THREE.DataTexture(tileIndices, mapWidth, mapHeight, THREE.RedFormat);

// Shader samples tile atlas based on position
fragmentShader: `
  vec2 mapCoord = floor(vUv * mapSize) / mapSize;
  float tileIndex = texture2D(tileData, mapCoord).r * 255.0;
  vec2 tilePos = fract(vUv * mapSize);  // Position within tile
  // Calculate atlas UV from tileIndex...
`
```

This achieves **1 draw call** regardless of map size but requires shader expertise and makes dynamic updates require texture uploads.

**InstancedMesh with Per-Instance UV Attributes** excels for procedural or dynamic tilemaps. Each tile instance shares geometry but has unique transforms and tile indices via `InstancedBufferAttribute`:

```javascript
const tileIndices = new Float32Array(tileCount);
geometry.setAttribute('tileIndex', new THREE.InstancedBufferAttribute(tileIndices, 1));
```

This maintains **1 draw call for thousands of tiles** while allowing runtime modification of individual tiles by updating instance attributes. The major limitation: all instances share one material, requiring a custom shader for per-instance tile selection.

**Individual Tile GameObjects** integrates cleanly with ECS architectures—each tile is a proper entity with components. However, performance degrades rapidly: **500+ draw calls causes major slowdowns** on most hardware. Reserve this approach for fewer than 100 tiles, or implement aggressive pooling and culling.

| Approach | Draw Calls (1000 tiles) | Dynamic Updates | ECS Integration | Best For |
|----------|------------------------|-----------------|-----------------|----------|
| Shader Atlas Plane | 1 | Texture upload | Poor | Static hand-crafted levels |
| InstancedMesh | 1 | O(1) per tile | Moderate | Procedural, many uniform tiles |
| Individual GameObjects | 1000 | O(1) per tile | Excellent | Small maps, interactive tiles |

## UV mapping for tileset sprite sheets eliminates texture bleeding

The critical technique for selecting tiles from a sprite sheet involves manipulating either texture properties or geometry UV attributes. For pixel art, **always use NearestFilter** to avoid blurring:

```javascript
texture.minFilter = THREE.NearestFilter;
texture.magFilter = THREE.NearestFilter;
texture.generateMipmaps = false;  // Prevents mipmap bleeding
```

To select a specific tile from an atlas:

```javascript
function getTileUV(tileIndex, atlasWidth, atlasHeight, tileSize) {
  const tilesPerRow = atlasWidth / tileSize;
  const tileX = tileIndex % tilesPerRow;
  const tileY = Math.floor(tileIndex / tilesPerRow);
  
  // Half-texel inset prevents sampling neighboring tiles
  const halfTexel = 0.5 / atlasWidth;
  return {
    startU: (tileX * tileSize + 0.5) / atlasWidth,
    endU: ((tileX + 1) * tileSize - 0.5) / atlasWidth,
    startV: 1 - ((tileY + 1) * tileSize - 0.5) / atlasHeight,
    endV: 1 - (tileY * tileSize + 0.5) / atlasHeight
  };
}
```

The **half-texel inset** is essential—it ensures UV coordinates sample pixel centers rather than edges, eliminating the grid lines that appear when adjacent tile pixels bleed through.

## Verticality through IntGrid layers and per-vertex height

Neither Tiled nor LDtk natively support 3D, but both provide mechanisms to encode height data that Three.js can interpret. **LDtk's IntGrid layers** are particularly suited for this—values 0-255 can represent elevation levels directly:

```javascript
// LDtk level structure with height layer
const heightLayer = level.layerInstances.find(l => l.__identifier === 'HeightMap');
const tilesLayer = level.layerInstances.find(l => l.__type === 'Tiles');

for (const tile of tilesLayer.gridTiles) {
  const gridX = tile.px[0] / tilesLayer.__gridSize;
  const gridY = tile.px[1] / tilesLayer.__gridSize;
  const elevation = heightLayer.intGridCsv[gridY * heightLayer.__cWid + gridX];
  
  // Create tile at elevation
  mesh.position.set(gridX, elevation * heightScale, gridY);
}
```

For continuous terrain rather than stepped platforms, use **PlaneGeometry with vertex displacement**:

```javascript
const geometry = new THREE.PlaneGeometry(worldSize, worldSize, segments, segments);
const positions = geometry.attributes.position.array;

for (let i = 0; i < positions.length; i += 3) {
  const x = positions[i], z = positions[i + 1];
  positions[i + 2] = heightmap.getHeight(x, z);
}
geometry.computeVertexNormals();
```

## LDtk outperforms Tiled for 2.5D game development

**LDtk is the recommended editor** for 2D-HD style games with verticality. Its IntGrid layers provide native encoding for both collision and height data, the JSON export format includes convenience fields prefixed with `__` for easier parsing, and auto-layers can procedurally place tiles based on IntGrid values.

For parsing, **`@excaliburjs/plugin-ldtk`** is the most actively maintained JavaScript library (updated within the last 3 months), though its parsing logic works independently of the Excalibur game engine:

```javascript
// Recommended LDtk layer structure for 2.5D
// Top to bottom:
// - Entities (spawn points, items with height fields)
// - Foreground_Tiles (rendered on top)
// - HeightMap (IntGrid: 0-10 representing Z levels)
// - CollisionMap (IntGrid: 1=solid, 0=passable)
// - Background_Tiles (always behind)
```

Tiled remains viable with **`tmx-map-parser`** for JSON exports, but encoding height requires custom tile properties or object layers—less elegant than LDtk's purpose-built IntGrid system.

## Auto-tiling with bitmasking enables procedural generation

**4-bit bitmasking** (16 tile variants) handles cardinal neighbors and provides immediate visual polish with minimal tileset work:

```javascript
calculateBitmask(x, y) {
  let mask = 0;
  if (this.isSolid(x, y - 1)) mask += 1;  // North
  if (this.isSolid(x + 1, y)) mask += 2;  // East
  if (this.isSolid(x, y + 1)) mask += 4;  // South
  if (this.isSolid(x - 1, y)) mask += 8;  // West
  return mask;  // 0-15, maps directly to tileset index
}
```

For production quality, the **47-tile blob system** handles diagonal neighbors and eliminates visual artifacts at corners—this is what RPG Maker and commercial engines use. The algorithm extends to 8-bit masking but reduces 256 theoretical cases to 47 visually distinct configurations.

**Wang tiles** offer an alternative for more organic, non-repeating terrain. Each tile's edges must match adjacent tiles' edges, enabling infinite non-periodic patterns. This works especially well for caves, forests, or any terrain where avoiding obvious repetition matters.

## Performance optimization requires chunking and draw call discipline

The **golden rule**: aim for fewer than 100 draw calls total. Modern GPUs handle millions of triangles effortlessly, but each draw call incurs CPU overhead that quickly becomes the bottleneck.

**Chunking strategy** for large worlds:
- **32×32 tiles per chunk** balances granularity against draw call count
- Maintain a **3×3 chunk grid** around the player minimum
- Implement **frustum culling** at chunk level:

```javascript
const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();
projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
frustum.setFromProjectionMatrix(projScreenMatrix);

chunks.forEach(chunk => {
  chunk.mesh.visible = frustum.intersectsBox(chunk.boundingBox);
});
```

For InstancedMesh, remember that **instances aren't individually culled by default**. Either implement manual culling by reordering instance matrices and adjusting `instancedMesh.count`, or accept rendering off-screen instances as the cost of batching.

## Integration pattern for existing ECS with SpriteComponent

Given your existing architecture with GameObjects, GameComponents, and trait-based lookup, a **hybrid rendering approach** provides the cleanest integration:

```javascript
// TileChunkComponent - owns batched geometry for static terrain
class TileChunkComponent extends GameComponent {
  constructor(chunkX, chunkY, chunkSize = 32) {
    this.instancedMesh = null;
    this.tileData = new Map();  // local coords -> tile info
    this.dirty = false;
  }
  
  setTile(localX, localY, tileIndex, height) {
    this.tileData.set(`${localX},${localY}`, { tileIndex, height });
    this.dirty = true;
  }
  
  rebuild() {
    if (!this.dirty) return;
    // Rebuild InstancedMesh from tileData
    this.dirty = false;
  }
}

// Individual TileComponents for special interactive tiles
class InteractiveTileComponent extends GameComponent {
  // Standard mesh, integrates with existing SpriteComponent for texture
}
```

This separates static terrain (batched for performance) from interactive elements (individual GameObjects for ECS flexibility). Your existing **TextureCache utility** can manage tileset atlas loading and provide the texture to both the batched renderer and individual SpriteComponents.

## The HD-2D look requires post-processing, not geometry tricks

The distinctive Octopath Traveler aesthetic comes from **post-processing effects**, not special geometry. The terrain itself is standard 3D—the magic happens in screen-space:

- **Tilt-shift blur**: Blurs top and bottom of frame based on screen Y position (not depth), creating a miniature/diorama appearance
- **Depth of field**: Standard camera DOF for foreground/background separation
- **Bloom**: Soft glow on bright areas for the warm, nostalgic feel
- **Vignetting**: Darkened corners focusing attention on center
- **Point light shadows**: Critical for grounding 2D sprites—they must cast shadows onto 3D terrain

For initial unlit flat rendering, skip post-processing. When you're ready to add polish, Three.js EffectComposer with custom tilt-shift and bloom passes will deliver the aesthetic.

## Recommended tileset resources

For 2D-HD style ground tiles:
- **itch.io pixel art packs**: Search "top-down tileset" or "RPG tileset"—many support the isometric/2.5D angle
- **OpenGameArt.org**: Free CC-licensed tilesets, varying quality
- **LPC (Liberated Pixel Cup)**: Consistent art style, extensive ground tile coverage
- **Kenney.nl**: High-quality free tilesets with commercial-friendly licensing

When selecting or creating tilesets, ensure they include auto-tile variants (47-tile blob format) if you plan to use procedural generation.

## Implementation roadmap

For your Vue 3 + Three.js + ECS architecture, proceed in this order:

1. **Single tile rendering**: PlaneGeometry + MeshBasicMaterial with tileset UV selection
2. **InstancedMesh batching**: Convert to instanced rendering with per-instance tile indices
3. **LDtk integration**: Load hand-crafted levels with height data from IntGrid layers
4. **Auto-tiling**: Implement 4-bit bitmasking for procedural sections
5. **Chunking**: Split world into 32×32 chunks with frustum culling
6. **Post-processing**: Add tilt-shift and bloom for HD-2D aesthetic

The **three-sprites** npm package provides ready-made tileset material support if you want to accelerate initial development, though custom shaders offer more control for the specific 2D-HD requirements.