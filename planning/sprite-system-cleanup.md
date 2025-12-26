# Sprite System Cleanup - Implementation Plan

**Prepared for:** Developer
**Reviewed by:** Architect
**Created:** 2025-12-24
**Status:** Ready for implementation

---

## Context

The sprite system works. The goal is to reduce complexity without breaking functionality. This plan combines immediate cleanup (low risk) with targeted improvements (medium risk), split into phases.

---

## Phase 1: Dead Code Removal

**Risk:** Low
**Effort:** 1 hour

### 1.1 SpriteSheetRegistry.ts

Remove unused methods:

- `unregister(id: string)`
- `clear()`
- `getTextureSources(id: string)`

### 1.2 spritesheet.types.ts

Remove unused interfaces:

- `I_DirectionalAnimationDef`
- `I_SpriteState`

### 1.3 spriteSheets.config.ts

Remove commented-out "hero" example (lines 103-128).

### 1.4 DirectionalSpriteAnimator.ts

Add clarifying comment at top of movement tracking section:

```typescript
// === Movement Tracking (opt-in) ===
// When movementSource is provided, animator auto-switches idle/walk
// and flips sprite based on movement direction.
```

**Verification:**

- [ ] `bun run dev` starts
- [ ] Player animates idle/walk
- [ ] Player flips when walking left
- [ ] No TypeScript errors

---

## Phase 2: Explicit Flip State

**Addresses:** Fragile scale.x preservation
**Risk:** Low
**Effort:** 30 minutes

### 2.1 SpriteComponent.ts

**Current problem:** Flip state is implicit (negative scale.x), requires fragile preservation logic in `syncTransform()`.

**Change:** Add explicit flip state.

```typescript
// Add property
private _flipX = false;

// Simplify setFlipX
setFlipX(flip: boolean): void {
  this._flipX = flip;
}

// Simplify isFlippedX
isFlippedX(): boolean {
  return this._flipX;
}

// Update syncTransform - apply flip after scale sync
private syncTransform(): void {
  const transform = this.getComponent(TransformComponent);
  if (transform && this.mesh) {
    this.mesh.position.copy(transform.position);
    this.mesh.rotation.copy(transform.rotation);
    this.mesh.scale.copy(transform.scale);
    // Apply flip state
    if (this._flipX) {
      this.mesh.scale.x = -Math.abs(this.mesh.scale.x);
    }
  }
}
```

**Verification:** Same as Phase 1 + flip persists after any transform changes.

---

## Phase 3: Type Consolidation

**Reduces type count from 5 → 3**
**Risk:** Medium (internal changes only)
**Effort:** 2 hours

### 3.1 Merge I_ExtendedAnimationDefinition into I_AnimationDefinition

**File:** `sprite.types.ts`

Add optional texture field to existing type:

```typescript
interface I_AnimationDefinition {
	name: string;
	startFrame: number;
	endFrame: number;
	fps: number;
	loop?: boolean;
	onComplete?: () => void;
	// Add for multi-texture:
	texturePath?: string;
}
```

### 3.2 Update spritesheet.types.ts

- Remove `I_ExtendedAnimationDefinition` (now merged)
- Keep `I_AnimationRowDefinition` but mark as `@internal`
- Keep `I_SimpleAnimationDef` (user input)
- Keep `I_QuickSpriteSheetConfig` (user input)

### 3.3 Update SpriteSheetRegistry.ts

- Remove `buildExtendedAnimations()`
- Update `buildAnimations()` to include `texturePath` in output
- Update internal method `animationRowsToDefinitions()` to include texture info

### 3.4 Update DirectionalSpriteAnimator.ts

- Remove `toExtendedAnimation()` conversion method
- Use `I_AnimationDefinition` directly (no conversion needed)

### 3.5 Update CharacterSprite.ts

- Change from `buildExtendedAnimations()` to `buildAnimations()`

**Result:**

| Before                        | After                                                 |
| ----------------------------- | ----------------------------------------------------- |
| I_SimpleAnimationDef          | I_SimpleAnimationDef (user input)                     |
| I_AnimationRowDefinition      | I_AnimationRowDefinition (internal)                   |
| I_AnimationDefinition         | I_AnimationDefinition (runtime, now with texturePath) |
| I_ExtendedAnimationDefinition | (removed)                                             |
| I_DirectionalAnimationDef     | (removed in Phase 1)                                  |
| I_SpriteState                 | (removed in Phase 1)                                  |

**Verification:** Same as Phase 1.

---

## Phase 4: Registry Method Extraction

**Simplifies expandQuickConfig()**
**Risk:** Medium
**Effort:** 1.5 hours

### 4.1 Split expandQuickConfig() into focused methods

**Current:** 85 lines, 4 nested conditional paths.

**New structure:**

```typescript
private expandQuickConfig(config: I_QuickSpriteSheetConfig): I_SpriteSheetDefinition {
  const hasExplicitRows = config.animations.some(a => a.row !== undefined);
  const isMulti = isMultiTexture(config.texture);

  let animations: I_AnimationRowDefinition[];

  if (hasExplicitRows) {
    animations = this.expandExplicitRows(config);
  } else if (config.directional) {
    animations = isMulti
      ? this.expandMultiTextureDirectional(config)
      : this.expandSequentialDirectional(config);
  } else {
    animations = this.expandSimple(config);
  }

  return {
    id: config.id,
    texture: config.texture,
    columns: config.framesPerRow,
    rows: config.totalRows,
    size: config.size,
    anchor: config.anchor ?? [0.5, 0],
    animations,
    defaultAnimation: config.defaultAnimation,
    isMultiTexture: isMulti,
  };
}

private expandExplicitRows(config): I_AnimationRowDefinition[] { ... }
private expandSequentialDirectional(config): I_AnimationRowDefinition[] { ... }
private expandMultiTextureDirectional(config): I_AnimationRowDefinition[] { ... }
private expandSimple(config): I_AnimationRowDefinition[] { ... }
```

Each method: ~15-25 lines, single responsibility.

### 4.2 Remove unused `layout` property

It's set but never read. Remove from `I_SpriteSheetDefinition`.

**Verification:** Same as Phase 1.

---

## Phase 5: Future Consideration (Not Now)

These items are noted for future consideration but **not part of this cleanup**:

| Item                                  | Reason to Defer                 |
| ------------------------------------- | ------------------------------- |
| Compose with SpriteAnimationComponent | High risk, significant refactor |
| Extract movement tracking             | Working, just debugged          |
| Singleton pattern alignment           | Cosmetic, low priority          |

---

## Summary

| Phase                  | Risk   | Effort | Lines Changed      |
| ---------------------- | ------ | ------ | ------------------ |
| 1. Dead Code Removal   | Low    | 1h     | -115               |
| 2. Explicit Flip State | Low    | 30m    | ~20                |
| 3. Type Consolidation  | Medium | 2h     | ~-80               |
| 4. Registry Extraction | Medium | 1.5h   | ~+30 (but simpler) |
| **Total**              |        | **5h** | **~-145**          |

---

## Recommended Approach

1. **Do Phase 1 now** — Ship it
2. **Do Phase 2 immediately after** — Low risk, prevents future bugs
3. **Do Phases 3-4 in next sprint** — Medium risk, test thoroughly

---

## Files to Modify

| Phase | File                                                         |
| ----- | ------------------------------------------------------------ |
| 1     | `src/game/utils/SpriteSheetRegistry.ts`                      |
| 1     | `src/game/common/spritesheet.types.ts`                       |
| 1     | `src/game/utils/spriteSheets.config.ts`                      |
| 1     | `src/game/components/rendering/DirectionalSpriteAnimator.ts` |
| 2     | `src/game/components/rendering/SpriteComponent.ts`           |
| 3     | `src/game/common/sprite.types.ts`                            |
| 3     | `src/game/common/spritesheet.types.ts`                       |
| 3     | `src/game/utils/SpriteSheetRegistry.ts`                      |
| 3     | `src/game/components/rendering/DirectionalSpriteAnimator.ts` |
| 3     | `src/game/prefabs/CharacterSprite.ts`                        |
| 4     | `src/game/utils/SpriteSheetRegistry.ts`                      |

---

## Verification Checklist (All Phases)

- [ ] `bun run dev` starts without errors
- [ ] Player sprite shows on screen
- [ ] Player idle animation plays
- [ ] Player walk animation plays when moving
- [ ] Player sprite flips when walking left
- [ ] Player sprite flips back when walking right
- [ ] No TypeScript errors
- [ ] No console warnings related to sprites
