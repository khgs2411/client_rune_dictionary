# Combat Overlay Modal System - Product Requirements Document

**Project**: RUNE RPG  
**Feature**: Combat as Overworld Overlay Modal  
**Version**: 2.0  
**Status**: Ready for Implementation  
**Date**: December 2024

---

## 1. Executive Summary

This document outlines the refactor of the combat system from a full-screen transition approach to an **overlay modal** that sits on top of the overworld. The player remains in the overworld visually, with combat UI appearing as a snappy overlay. Movement is completely disabled during combat.

### Key Architecture Decision

| Layer            | Responsibility                             | Technology |
| ---------------- | ------------------------------------------ | ---------- |
| **Three.js**     | World, physics, exploration, adventure     | 3D Engine  |
| **Vue/HTML/CSS** | UI, HUD, **Battle Screen**, Battle Sprites | Native Web |

**Battle sprites are rendered as Vue components, NOT Three.js objects.** This keeps the 3D engine focused on world simulation while leveraging web-native technologies for UI and battle visuals.

### Key Goals

1. Combat appears as an overlay/modal on the overworld (no screen transition)
2. **Completely disable movement** while in combat
3. **Vue-native battle sprites** with CSS animations (not Three.js)
4. Refactor MatchHUD to act as a proper overlay modal encapsulating all battle UI
5. **Snappy, smooth transitions** - players will enter many matches, no time wasted

### Design Reference

Based on pixel-art RPG mockup (Octopath Traveler style) with:

- Battle stage with player sprites (left) and enemy sprites (right)
- Unified ATB bar (top center) showing all combatants
- Stacked party status panels (bottom left) - future-proofed for party system
- 8-slot action bar (bottom right)
- Combat log (bottom center) - **deferred to future phase**

### Libraries Used

- **VueUse**: `useImage`, `useTransition`, `useRafFn`, `usePreferredReducedMotion`
- **Reka UI**: `Tooltip`, `Progress` (new)
- **Iconify**: `lucide`, `game-icons` collections

---

## 2. Current Architecture Analysis

### 2.1 State Management

**SceneState System** (`src/game/systems/SceneState.ts`)

| State           | Purpose              |
| --------------- | -------------------- |
| `OVERWORLD`     | Normal gameplay      |
| `MATCH_REQUEST` | API call in progress |
| `PVE_MATCH`     | Active combat        |
| `PVP_MATCH`     | PvP combat (future)  |
| `MENU`          | Menu open            |

### 2.2 Current Combat Flow

```
[OVERWORLD] → [Double-click NPC] → [MATCH_REQUEST] → [API Call] → [PVE_MATCH] → [Leave/Victory] → [OVERWORLD]
```

**Components Involved:**

1. **MatchComponent** - Attached to NPCs, triggers match on double-click
2. **MatchModule** - Orchestrates match lifecycle:
    - Spawns arena (walls, grid, camera anchor)
    - Transitions camera to fixed match position
    - Cleans up on exit
3. **MatchHUD** - Fixed overlay UI with:
    - StatusPanel (player & enemy)
    - TurnTimer
    - ActionBar (draggable)

### 2.3 Current Movement Behavior

**KinematicMovementComponent** (`src/game/components/entities/KinematicMovementComponent.ts`)

| State         | Movement       | Jumping     |
| ------------- | -------------- | ----------- |
| OVERWORLD     | ✅ Enabled     | ✅ Enabled  |
| MATCH_REQUEST | ❌ Disabled    | ❌ Disabled |
| **PVE_MATCH** | **✅ Enabled** | ❌ Disabled |
| MENU          | ❌ Disabled    | ❌ Disabled |

**Issue**: Movement is currently enabled during PVE_MATCH. This needs to change to disabled.

### 2.4 Current MatchHUD Structure

```vue
<template>
	<div v-if="isVisible" class="fixed inset-0 pointer-events-none">
		<!-- TurnTimer (top-center) -->
		<!-- StatusPanel Enemy (top-right) -->
		<!-- StatusPanel Player (bottom-left) -->
		<!-- ActionBar (draggable) -->
	</div>
</template>
```

**Visibility Logic**: `matchStore.currentMatchId !== null`

### 2.5 Camera Behavior (MatchModule)

- **Enter Match**: Camera snaps to fixed position, `freezeReactiveUpdates = true`
- **Exit Match**: Camera returns to follow player, angles reset to overworld perspective

---

## 3. Requirements

### 3.1 Movement Disable (Required)

**MUST completely disable movement during combat.**

| State         | Movement        | Jumping     |
| ------------- | --------------- | ----------- |
| OVERWORLD     | ✅ Enabled      | ✅ Enabled  |
| MATCH_REQUEST | ❌ Disabled     | ❌ Disabled |
| **PVE_MATCH** | **❌ Disabled** | ❌ Disabled |
| PVP_MATCH     | ❌ Disabled     | ❌ Disabled |
| MENU          | ❌ Disabled     | ❌ Disabled |

### 3.2 Camera Behavior (TBD - Based on Mockup)

**Options to discuss:**

| Option                 | Description                          | Pros                | Cons                  |
| ---------------------- | ------------------------------------ | ------------------- | --------------------- |
| **A. Keep Current**    | Camera snaps to fixed match position | Clean battle view   | Feels like transition |
| **B. Freeze in Place** | Camera stays where it is             | True overlay feel   | May have poor angle   |
| **C. Subtle Zoom**     | Small zoom to center on arena        | Best of both worlds | Slightly more complex |

**Recommendation**: Wait for mockup to decide. Option B or C likely best for overlay feel.

### 3.3 Arena Dome (Preserved)

The existing arena implementation stays untouched:

- `MatchAreaWalls` - Physical boundaries
- `MatchGrid` - Tactical grid overlay
- `MatchCameraAnchor` - Camera reference point

These components may continue to spawn but their visual presence is secondary to the overlay UI.

### 3.4 MatchHUD Refactor (Overlay Modal Pattern)

Transform MatchHUD into a proper overlay modal following the GrimoireOverlay pattern:

**Current Pattern (MatchHUD):**

```vue
<div v-if="isVisible" class="fixed inset-0 pointer-events-none">
  <!-- Individual UI elements scattered -->
</div>
```

**New Pattern (Combat Modal):**

```vue
<Teleport to="body">
  <Transition name="combat-enter">
    <div v-if="isInCombat" class="fixed inset-0 z-50">
      <!-- Optional: Semi-transparent backdrop -->
      <div class="absolute inset-0 bg-black/20 pointer-events-none" />
      
      <!-- Combat Container (encapsulates all battle UI) -->
      <div class="combat-container">
        <!-- TurnTimer, StatusPanels, ActionBar -->
      </div>
    </div>
  </Transition>
</Teleport>
```

### 3.5 Visual Design (Finalized from Mockup)

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CombatOverlay.vue (z-40)                        │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    UnifiedATBBar.vue                          │  │
│  │  [P1 ████░░░░]  │  [████░░░░ E1]                              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                        TURN TIMER: 15s                              │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                   BattleStage.vue                             │  │
│  │                                                               │  │
│  │    ┌─────────┐                         ┌─────────┐            │  │
│  │    │  <img>  │                         │  <img>  │            │  │
│  │    │ player  │                         │  enemy  │            │  │
│  │    │ sprite  │                         │ sprite  │            │  │
│  │    └─────────┘                         └─────────┘            │  │
│  │       CSS                                 CSS                 │  │
│  │    animations                          animations             │  │
│  │                                                               │  │
│  │    BattleSprite.vue                   BattleSprite.vue        │  │
│  │    facing="right"                     facing="left"           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────┐                  ┌────────────────────────┐   │
│  │PartyStatusPanel │                  │      ActionBar         │   │
│  │ ┌─────────────┐ │                  │ ┌────┐┌────┐┌────┐     │   │
│  │ │ Player 1   │ │                  │ │ ⚔️ ││ 🛡️ ││ 🔥 │ ... │   │
│  │ │ HP ████████ │ │                  │ └────┘└────┘└────┘     │   │
│  │ │ MP ████     │ │                  │  Tooltip on hover      │   │
│  │ │ 🔥 ❄️ ⚡    │ │                  └────────────────────────┘   │
│  │ └─────────────┘ │                                               │
│  │ ┌─────────────┐ │              (Future: CombatLog.vue)          │
│  │ │ Player 2   │ │                                               │
│  │ └─────────────┘ │                                               │
│  └─────────────────┘                                               │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════   │
│  ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ THREE.JS FROZEN BEHIND ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Battle Stage (Vue-Native, NOT Three.js)

The battle stage is a pure Vue component with CSS animations. **No Three.js involvement.**

```
┌─────────────────────────────────────────────────────────────────┐
│                    BattleStage.vue                              │
│                                                                 │
│   PLAYER ZONE (left)              ENEMY ZONE (right)           │
│   ┌─────────────────┐             ┌─────────────────┐          │
│   │                 │             │                 │          │
│   │   ┌─────────┐   │             │   ┌─────────┐   │          │
│   │   │ PLAYER  │   │             │   │  ENEMY  │   │          │
│   │   │  ~~~~   │   │             │   │  ~~~~   │   │          │
│   │   │  /||\   │   │   VS        │   │  /||\   │   │          │
│   │   │  /  \   │   │             │   │  /  \   │   │          │
│   │   └─────────┘   │             │   └─────────┘   │          │
│   │  BattleSprite   │             │  BattleSprite   │          │
│   │  facing="right" │             │  facing="left"  │          │
│   │  state="idle"   │             │  state="idle"   │          │
│   └─────────────────┘             └─────────────────┘          │
│                                                                 │
│   flex: justify-between, align-items: flex-end                 │
└─────────────────────────────────────────────────────────────────┘
```

**Why Vue-native?**

- Battle sprites don't need physics
- CSS animations are sufficient (idle bounce, attack lunge, hurt shake)
- Simpler lifecycle (Vue unmount = cleanup)
- Better accessibility (reduced motion support)
- Leverages existing web skills

#### Component Specifications with Libraries

| Component            | VueUse                                  | Reka UI               | Iconify                    |
| -------------------- | --------------------------------------- | --------------------- | -------------------------- |
| **BattleStage**      | `useElementSize`                        | -                     | -                          |
| **BattleSprite**     | `useImage`, `usePreferredReducedMotion` | -                     | -                          |
| **UnifiedATBBar**    | `useTransition`                         | `Progress`            | `lucide:swords`            |
| **PartyStatusPanel** | `useTransition`                         | `Progress`, `Tooltip` | `game-icons:*` (buffs)     |
| **ActionBar**        | `useMagicKeys`                          | `Tooltip`             | `game-icons:*` (abilities) |
| **TurnTimerText**    | `useRafFn`                              | -                     | `lucide:clock`             |

#### Sprite Animation States

```typescript
type SpriteAnimationState = "idle" | "attack" | "hurt" | "victory" | "defeat";
```

| State     | CSS Animation            | Trigger            |
| --------- | ------------------------ | ------------------ |
| `idle`    | Subtle bounce (1s loop)  | Default            |
| `attack`  | Lunge forward (0.3s)     | On action          |
| `hurt`    | Shake + red flash (0.2s) | On damage received |
| `victory` | Jump + spin (0.5s)       | On match win       |
| `defeat`  | Fall over (0.4s)         | On match loss      |

#### Component Specifications

| Component           | Position      | Details                                                                                                                           |
| ------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Unified ATB Bar** | Top center    | Single horizontal bar with all combatants. Color-coded segments (blue=player, red=enemy). Small icons or initials as identifiers. |
| **Turn Timer**      | Below ATB     | Simple text display: "TURN TIMER: Xs" - no progress bar needed                                                                    |
| **Party Status**    | Bottom left   | Stacked panels (2 slots now, expandable). Each shows: name, HP bar, MP bar, buff icons. Future-proofed for party system.          |
| **Action Bar**      | Bottom right  | 8 ability slots + Pass/Run buttons. Keybind indicators (1-8). **Remove draggable** - fixed position for consistency.              |
| **Combat Log**      | Bottom center | **DEFERRED** - Will parse existing WebSocket events later                                                                         |

#### Backdrop & Overlay

- **No dark backdrop** - 3D scene remains fully visible
- **No vignette** - Clean overlay, no visual filters
- UI elements have subtle `bg-card/90 backdrop-blur-sm` for readability (current style)

#### Entry Animation (Snappy)

```
Duration: 150-200ms total

Sequence:
1. Camera begins snap/zoom (0ms)
2. ATB Bar slides down from top (0ms, 150ms duration)
3. Party Status slides in from left (25ms delay, 150ms duration)
4. Action Bar slides in from right (25ms delay, 150ms duration)
5. Turn Timer fades in (50ms delay, 100ms duration)

Easing: ease-out (fast start, smooth stop)
```

#### Exit Animation (Snappy)

```
Duration: 100-150ms total

Sequence:
1. All UI elements fade out simultaneously (100ms)
2. Camera begins return transition (50ms delay)

Easing: ease-in (smooth start, fast finish)
```

#### Camera Behavior (Snappy & Creative)

**Approach: "Combat Focus Snap"**

```
Entry:
1. Store current camera state (position, angles, distance)
2. Calculate arena center (midpoint between player and target)
3. Snap camera to isometric combat view:
   - Distance: Zoom in ~20% from current
   - Angle: Slight adjustment to frame combatants
   - Duration: 150ms with ease-out
4. Freeze camera updates

Exit:
1. Snap back to stored camera state
2. Duration: 100ms with ease-in
3. Resume camera follow
```

**Why this works:**

- Snappy = feels responsive, no waiting
- Slight zoom creates "combat focus" feeling
- Storing/restoring state ensures seamless return
- Short duration means players can chain matches quickly

---

## 4. Technical Implementation Plan

### 4.1 Phase 1: Movement Disable (Minimal Change)

**File**: `src/game/components/entities/KinematicMovementComponent.ts`

**Change**: Update `onStateChange` method

```typescript
case E_SceneState.PVE_MATCH:
case E_SceneState.PVP_MATCH:
  this.enableMovement = false;  // Changed from true
  this.enableJumping = false;
  console.log("🏃 [KinematicMovementComponent] Movement: 🚫 | Jumping: 🚫");
  break;
```

**Effort**: ~5 minutes  
**Risk**: Low

### 4.2 Phase 2: Camera Behavior (Simplified)

**File**: `src/game/modules/scene/MatchModule.ts`

Since battle sprites are Vue-native, the camera just needs to **freeze in place** (no zoom needed - the Vue overlay covers everything).

```typescript
private transitionToMatchCamera(): void {
  const camera = this.context?.camera;
  if (!camera) return;

  // Simply freeze camera updates - Vue overlay handles visuals
  camera.controller.freezeReactiveUpdates.value = true;

  console.log("⚔️ [MatchModule] Camera frozen for combat overlay");
}

private transitionToOverworldCamera(): void {
  const camera = this.context?.camera;
  if (!camera) return;

  // Resume following player
  camera.controller.freezeReactiveUpdates.value = false;

  console.log("⚔️ [MatchModule] Camera resumed");
}
```

**Effort**: ~15 minutes  
**Risk**: Low

### 4.3 Phase 3: Add Progress Component to UI Library

**File**: `src/components/ui/progress/Progress.vue`

```vue
<template>
	<div class="h-2 bg-muted rounded-full overflow-hidden" :class="containerClass">
		<div class="h-full transition-all" :class="[colorClass, transitionClass]" :style="{ width: `${percentage}%` }" />
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
	defineProps<{
		value: number;
		max?: number;
		color?: "default" | "health" | "mana" | "atb" | "enemy";
		animated?: boolean;
	}>(),
	{
		max: 100,
		color: "default",
		animated: true,
	},
);

const percentage = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)));

const colorClass = computed(() => {
	const colors = {
		default: "bg-primary",
		health: percentage.value > 50 ? "bg-green-500" : percentage.value > 25 ? "bg-yellow-500" : "bg-red-500",
		mana: "bg-blue-500",
		atb: "bg-primary",
		enemy: "bg-destructive",
	};
	return colors[props.color];
});

const transitionClass = computed(() => (props.animated ? "duration-300 ease-out" : "duration-0"));
</script>
```

**File**: `src/components/ui/progress/index.ts`

```typescript
export { default as Progress } from "./Progress.vue";
```

**Effort**: ~20 minutes  
**Risk**: Low

### 4.4 Phase 4: New Component Architecture

**File**: `src/game/modules/scene/MatchModule.ts`

**Changes**:

1. Store camera state before transition
2. Implement snappy zoom-in transition (150ms)
3. Implement snappy zoom-out transition (100ms)

```typescript
// New private properties
private savedCameraState: {
  position: Vector3;
  distance: number;
  horizontalAngle: number;
  verticalAngle: number;
} | null = null;

private transitionToMatchCamera(center: Vector3): void {
  const camera = this.context?.camera;
  if (!camera) return;

  // 1. Store current state for restoration
  this.savedCameraState = {
    position: camera.instance.position.clone(),
    distance: camera.controller.distance.value,
    horizontalAngle: camera.controller.angle.horizontal.value,
    verticalAngle: camera.controller.angle.vertical.value,
  };

  // 2. Calculate combat focus position
  const combatDistance = this.savedCameraState.distance * 0.8; // 20% zoom
  const cameraPos = this.calculateCameraPosition(center);

  // 3. Snap to combat view (150ms)
  // Using CSS transition or GSAP for smooth interpolation
  camera.controller.distance.value = combatDistance;
  camera.instance.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
  camera.instance.lookAt(center);
  camera.controller.freezeReactiveUpdates.value = true;
}

private transitionToOverworldCamera(): void {
  const camera = this.context?.camera;
  if (!camera || !this.savedCameraState) return;

  // Restore saved state (100ms)
  camera.controller.distance.value = this.savedCameraState.distance;
  camera.controller.angle.horizontal.value = this.savedCameraState.horizontalAngle;
  camera.controller.angle.vertical.value = this.savedCameraState.verticalAngle;

  // Resume following player
  camera.controller.freezeReactiveUpdates.value = false;
  this.savedCameraState = null;
}
```

**Effort**: ~45 minutes  
**Risk**: Low-Medium

### 4.4 Phase 4: New Component Architecture

**New File Structure:**

```
src/components/match/
├── CombatOverlay.vue        # Container with Teleport/Transition
├── BattleStage.vue          # NEW - Battle sprite area (Vue-native)
│   └── BattleSprite.vue     # NEW - Individual sprite with CSS animations
├── UnifiedATBBar.vue        # All combatants ATB display
├── PartyStatusPanel.vue     # Stacked player status panels
│   └── StatusEffectIcon.vue # NEW - Buff/debuff icons
├── ActionBar.vue            # MODIFY - Remove draggable, add tooltips
│   └── ActionSlot.vue       # NEW - Individual action with icon + tooltip
├── TurnTimerText.vue        # Simple text display
├── StatusPanel.vue          # DEPRECATE
├── TurnTimer.vue            # DEPRECATE
└── MatchHUD.vue             # DEPRECATE

src/components/ui/
└── progress/                # NEW - Add to UI library
    ├── Progress.vue
    └── index.ts
```

### 4.5 Phase 5: BattleStage.vue (NEW - Vue-Native Battle Area)

**File**: `src/components/match/BattleStage.vue`

```vue
<template>
	<div ref="stageRef" class="battle-stage relative flex justify-between items-end px-[10%] h-[50vh]">
		<!-- Player Zone (Left) -->
		<div class="combatant-zone flex flex-col items-center gap-4">
			<BattleSprite v-for="member in partyMembers" :key="member.id" :sprite-url="member.spriteUrl" :name="member.name" :state="member.animationState" facing="right" :scale="spriteScale" />
		</div>

		<!-- Enemy Zone (Right) -->
		<div class="combatant-zone flex flex-col items-center gap-4">
			<BattleSprite v-for="enemy in enemies" :key="enemy.id" :sprite-url="enemy.spriteUrl" :name="enemy.name" :state="enemy.animationState" facing="left" :scale="spriteScale" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useElementSize } from "@vueuse/core";
import BattleSprite from "./BattleSprite.vue";

interface Combatant {
	id: string;
	name: string;
	spriteUrl: string;
	animationState: "idle" | "attack" | "hurt" | "victory" | "defeat";
}

defineProps<{
	partyMembers: Combatant[];
	enemies: Combatant[];
}>();

// Responsive sprite scaling based on stage size
const stageRef = ref<HTMLElement | null>(null);
const { width } = useElementSize(stageRef);

const spriteScale = computed(() => {
	if (width.value < 640) return 0.75; // Mobile
	if (width.value < 1024) return 1; // Tablet
	return 1.25; // Desktop
});
</script>
```

**Effort**: ~30 minutes  
**Risk**: Low

### 4.6 Phase 6: BattleSprite.vue (NEW - Animated Sprite)

**File**: `src/components/match/BattleSprite.vue`

```vue
<template>
	<div class="battle-sprite" :class="[`facing-${facing}`, `state-${state}`, { 'reduce-motion': prefersReducedMotion }]" :style="{ transform: `scale(${scale})` }">
		<img v-if="isLoaded" :src="spriteUrl" :alt="name" class="sprite-image pixelated select-none" draggable="false" />
		<!-- Loading placeholder -->
		<div v-else class="w-24 h-32 bg-muted/50 rounded animate-pulse" />
	</div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useImage, usePreferredReducedMotion } from "@vueuse/core";

const props = withDefaults(
	defineProps<{
		spriteUrl: string;
		name: string;
		state?: "idle" | "attack" | "hurt" | "victory" | "defeat";
		facing?: "left" | "right";
		scale?: number;
	}>(),
	{
		state: "idle",
		facing: "right",
		scale: 1,
	},
);

// Preload sprite image
const { isLoading } = useImage({ src: props.spriteUrl });
const isLoaded = computed(() => !isLoading.value);

// Accessibility: respect reduced motion preference
const prefersReducedMotion = usePreferredReducedMotion();
</script>

<style scoped>
.sprite-image {
	image-rendering: pixelated;
	image-rendering: crisp-edges;
}

.facing-left {
	transform: scaleX(-1);
}

/* Animation states */
.state-idle:not(.reduce-motion) {
	animation: idle-bounce 1s ease-in-out infinite;
}

.state-attack:not(.reduce-motion) {
	animation: attack-lunge 0.3s ease-out;
}

.state-hurt:not(.reduce-motion) {
	animation: hurt-shake 0.2s ease-in-out;
	filter: brightness(1.5) saturate(0.5);
}

.state-victory:not(.reduce-motion) {
	animation: victory-jump 0.5s ease-out;
}

.state-defeat:not(.reduce-motion) {
	animation: defeat-fall 0.4s ease-in forwards;
}

/* Reduced motion: no animations, just state colors */
.reduce-motion.state-hurt {
	filter: brightness(1.5) saturate(0.5);
}

.reduce-motion.state-defeat {
	opacity: 0.5;
}

@keyframes idle-bounce {
	0%,
	100% {
		transform: translateY(0);
	}
	50% {
		transform: translateY(-4px);
	}
}

@keyframes attack-lunge {
	0% {
		transform: translateX(0);
	}
	50% {
		transform: translateX(30px);
	}
	100% {
		transform: translateX(0);
	}
}

@keyframes hurt-shake {
	0%,
	100% {
		transform: translateX(0);
	}
	20% {
		transform: translateX(-8px);
	}
	40% {
		transform: translateX(8px);
	}
	60% {
		transform: translateX(-4px);
	}
	80% {
		transform: translateX(4px);
	}
}

@keyframes victory-jump {
	0% {
		transform: translateY(0) rotate(0deg);
	}
	50% {
		transform: translateY(-20px) rotate(10deg);
	}
	100% {
		transform: translateY(0) rotate(0deg);
	}
}

@keyframes defeat-fall {
	0% {
		transform: translateY(0) rotate(0deg);
		opacity: 1;
	}
	100% {
		transform: translateY(10px) rotate(-90deg);
		opacity: 0.5;
	}
}
</style>
```

**Effort**: ~45 minutes  
**Risk**: Low

### 4.7 Phase 7: CombatOverlay.vue (Main Container)

**File**: `src/components/match/CombatOverlay.vue`

```vue
<template>
	<Teleport to="body">
		<Transition name="combat-overlay">
			<div v-if="isInCombat" class="fixed inset-0 z-40 pointer-events-none">
				<!-- Top Section: ATB + Turn Timer -->
				<div class="absolute top-0 left-1/2 -translate-x-1/2 mt-4 pointer-events-auto combat-slide-down">
					<UnifiedATBBar :players="players" :enemies="enemies" />
					<TurnTimerText class="mt-2 combat-fade-in" :seconds="turnTimeRemaining" :is-visible="isTurnActive" />
				</div>

				<!-- Center: Battle Stage (Vue-native sprites) -->
				<div class="absolute inset-0 flex items-center justify-center pointer-events-none">
					<BattleStage class="w-full max-w-4xl combat-fade-in" :party-members="partyMembersWithSprites" :enemies="enemiesWithSprites" />
				</div>

				<!-- Bottom Left: Party Status -->
				<div class="absolute bottom-4 left-4 pointer-events-auto combat-slide-left">
					<PartyStatusPanel :party-members="partyMembers" />
				</div>

				<!-- Bottom Right: Action Bar -->
				<div class="absolute bottom-4 right-4 pointer-events-auto combat-slide-right">
					<ActionBar :is-player-turn="isPlayerTurn" :is-leaving="isLeaving" @action="handleAction" @leave-match="handleLeaveMatch" />
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMatchStore } from "@/stores/match.store";
import { useWebSocketStore } from "@/stores/websocket.store";
import { E_SceneState } from "@/game/systems/SceneState";
import { useRxjs } from "topsyde-utils";
import MatchAPI from "@/api/match.api";

import UnifiedATBBar from "./UnifiedATBBar.vue";
import TurnTimerText from "./TurnTimerText.vue";
import BattleStage from "./BattleStage.vue";
import PartyStatusPanel from "./PartyStatusPanel.vue";
import ActionBar from "./ActionBar.vue";

const rxjs = useRxjs("scene:state");
const matchStore = useMatchStore();
const websocketStore = useWebSocketStore();

const isInCombat = computed(() => matchStore.currentMatchId !== null);
const isLeaving = ref(false);

// ATB Bar data
const players = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		readiness: matchStore.match.player?.readiness ?? 0,
	},
]);

const enemies = computed(() => [
	{
		id: "enemy",
		name: matchStore.match.npc?.name ?? "Enemy",
		readiness: matchStore.match.npc?.readiness ?? 0,
	},
]);

// Battle Stage sprites (with animation state)
const playerAnimationState = ref<"idle" | "attack" | "hurt" | "victory" | "defeat">("idle");
const enemyAnimationState = ref<"idle" | "attack" | "hurt" | "victory" | "defeat">("idle");

const partyMembersWithSprites = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		spriteUrl: "/sprites/knight_00.png", // TODO: Get from player data
		animationState: playerAnimationState.value,
	},
]);

const enemiesWithSprites = computed(() => [
	{
		id: "enemy",
		name: matchStore.match.npc?.name ?? "Enemy",
		spriteUrl: "/sprites/goblin_00.png", // TODO: Get from NPC data
		animationState: enemyAnimationState.value,
	},
]);

// Party Status data
const partyMembers = computed(() => [
	{
		id: "player",
		name: matchStore.match.player?.name ?? "Player",
		hp: matchStore.match.player?.health ?? 0,
		maxHp: matchStore.match.player?.maxHealth ?? 1,
		mp: 10, // TODO: Add MP to participant interface
		maxMp: 10,
		statusEffects: [], // TODO: Add status effects
	},
]);

// Turn state
const isPlayerTurn = computed(() => matchStore.match.turn.isPlayerTurn);
const isTurnActive = computed(() => matchStore.match.turnTimer.visible);
const turnTimeRemaining = computed(() => Math.ceil((matchStore.match.timer.remaining ?? 0) / 1000));

// Animation triggers based on match events
watch(
	() => matchStore.match.player?.health,
	(newHp, oldHp) => {
		if (oldHp && newHp && newHp < oldHp) {
			playerAnimationState.value = "hurt";
			setTimeout(() => (playerAnimationState.value = "idle"), 300);
		}
	},
);

watch(
	() => matchStore.match.npc?.health,
	(newHp, oldHp) => {
		if (oldHp && newHp && newHp < oldHp) {
			enemyAnimationState.value = "hurt";
			setTimeout(() => (enemyAnimationState.value = "idle"), 300);
		}
	},
);

// Handlers (from original MatchHUD)
async function handleAction(action: number | string) {
	if (action === "attack") {
		playerAnimationState.value = "attack";
		setTimeout(() => (playerAnimationState.value = "idle"), 300);
	}
	// ... rest of action handling
}

async function handleLeaveMatch() {
	if (!matchStore.currentMatchId || !websocketStore.clientData) return;

	isLeaving.value = true;
	try {
		const api = new MatchAPI();
		await api.leaveMatch({
			whoami: websocketStore.clientData,
			matchId: matchStore.currentMatchId,
		});
		matchStore.$reset();
		rxjs.$next("onStateChange", E_SceneState.OVERWORLD);
	} catch (error) {
		console.error("[CombatOverlay] Failed to leave match:", error);
	} finally {
		isLeaving.value = false;
	}
}

// Auto-leave on match finish
watch(
	() => matchStore.matchState,
	async (state) => {
		if (state === "FINISHED") {
			await handleLeaveMatch();
		}
	},
);
</script>

<style scoped>
/* Entry animations - staggered, snappy */
.combat-slide-down {
	animation: slideDown 150ms ease-out;
}

.combat-slide-left {
	animation: slideLeft 150ms ease-out 25ms backwards;
}

.combat-slide-right {
	animation: slideRight 150ms ease-out 25ms backwards;
}

.combat-fade-in {
	animation: fadeIn 150ms ease-out 50ms backwards;
}

@keyframes slideDown {
	from {
		transform: translateX(-50%) translateY(-20px);
		opacity: 0;
	}
	to {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}
}

@keyframes slideLeft {
	from {
		transform: translateX(-20px);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes slideRight {
	from {
		transform: translateX(20px);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

/* Exit animation - all at once, fast */
.combat-overlay-leave-active {
	transition: opacity 100ms ease-in;
}

.combat-overlay-leave-to {
	opacity: 0;
}
</style>
```

**Effort**: ~1.5 hours  
**Risk**: Low

### 4.8 Phase 8: UnifiedATBBar.vue (With VueUse & Progress)

**File**: `src/components/match/UnifiedATBBar.vue`

```vue
<template>
	<div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg px-4 py-2">
		<div class="flex items-center gap-4">
			<!-- Player Section -->
			<div class="flex items-center gap-3">
				<div v-for="player in players" :key="player.id" class="flex items-center gap-2">
					<!-- Player indicator -->
					<div class="w-7 h-7 rounded bg-primary flex items-center justify-center">
						<Icon icon="lucide:user" class="w-4 h-4 text-primary-foreground" />
					</div>
					<!-- ATB Progress -->
					<div class="w-20">
						<Progress :value="smoothReadiness(player.readiness).value" :max="100" color="atb" />
					</div>
				</div>
			</div>

			<!-- Divider with swords icon -->
			<div class="flex items-center gap-1 text-muted-foreground">
				<Icon icon="lucide:swords" class="w-4 h-4" />
			</div>

			<!-- Enemy Section -->
			<div class="flex items-center gap-3">
				<div v-for="enemy in enemies" :key="enemy.id" class="flex items-center gap-2">
					<!-- ATB Progress -->
					<div class="w-20">
						<Progress :value="smoothReadiness(enemy.readiness).value" :max="100" color="enemy" />
					</div>
					<!-- Enemy indicator -->
					<div class="w-7 h-7 rounded bg-destructive flex items-center justify-center">
						<Icon icon="lucide:skull" class="w-4 h-4 text-destructive-foreground" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useTransition, TransitionPresets } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { Progress } from "@/components/ui/progress";

interface Combatant {
	id: string;
	name: string;
	readiness: number;
}

defineProps<{
	players: Combatant[];
	enemies: Combatant[];
}>();

// Smooth ATB transitions (no jumpy updates)
function smoothReadiness(value: number) {
	return useTransition(value, {
		duration: 100,
		transition: TransitionPresets.easeOutCubic,
	});
}
</script>
```

**Effort**: ~30 minutes  
**Risk**: Low

### 4.9 Phase 9: PartyStatusPanel.vue (With Progress, Tooltip, Iconify)

**File**: `src/components/match/PartyStatusPanel.vue`

```vue
<template>
	<div class="flex flex-col gap-2">
		<div v-for="member in partyMembers" :key="member.id" class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 min-w-[220px]">
			<!-- Name -->
			<div class="flex items-center justify-between mb-2">
				<span class="text-sm font-semibold text-foreground">{{ member.name }}</span>
				<!-- Status Effects -->
				<div class="flex items-center gap-1">
					<Tooltip v-for="effect in member.statusEffects" :key="effect.id">
						<TooltipTrigger>
							<StatusEffectIcon :effect="effect" />
						</TooltipTrigger>
						<TooltipContent>
							<p class="font-semibold">{{ effect.name }}</p>
							<p class="text-xs text-muted-foreground">{{ effect.description }}</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<!-- HP Bar -->
			<div class="space-y-1">
				<div class="flex items-center justify-between">
					<span class="text-xs text-muted-foreground flex items-center gap-1">
						<Icon icon="lucide:heart" class="w-3 h-3" />
						HP
					</span>
					<span class="text-xs font-mono">{{ Math.round(smoothHp(member).value) }}/{{ member.maxHp }}</span>
				</div>
				<Progress :value="smoothHp(member).value" :max="member.maxHp" color="health" />
			</div>

			<!-- MP Bar -->
			<div class="space-y-1 mt-2">
				<div class="flex items-center justify-between">
					<span class="text-xs text-muted-foreground flex items-center gap-1">
						<Icon icon="lucide:droplets" class="w-3 h-3" />
						MP
					</span>
					<span class="text-xs font-mono">{{ Math.round(smoothMp(member).value) }}/{{ member.maxMp }}</span>
				</div>
				<Progress :value="smoothMp(member).value" :max="member.maxMp" color="mana" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useTransition, TransitionPresets } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import StatusEffectIcon from "./StatusEffectIcon.vue";

interface StatusEffect {
	id: string;
	name: string;
	description: string;
	icon: string; // Iconify icon name
	type: "buff" | "debuff";
}

interface PartyMember {
	id: string;
	name: string;
	hp: number;
	maxHp: number;
	mp: number;
	maxMp: number;
	statusEffects: StatusEffect[];
}

defineProps<{
	partyMembers: PartyMember[];
}>();

// Smooth HP/MP drain animations
function smoothHp(member: PartyMember) {
	return useTransition(() => member.hp, {
		duration: 300,
		transition: TransitionPresets.easeOutCubic,
	});
}

function smoothMp(member: PartyMember) {
	return useTransition(() => member.mp, {
		duration: 300,
		transition: TransitionPresets.easeOutCubic,
	});
}
</script>
```

**File**: `src/components/match/StatusEffectIcon.vue`

```vue
<template>
	<div class="w-5 h-5 rounded flex items-center justify-center" :class="effect.type === 'buff' ? 'bg-green-500/20' : 'bg-red-500/20'">
		<Icon :icon="effect.icon" class="w-3 h-3" :class="effect.type === 'buff' ? 'text-green-500' : 'text-red-500'" />
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
	effect: {
		icon: string;
		type: "buff" | "debuff";
	};
}>();
</script>
```

**Common Status Effect Icons (game-icons collection):**

```typescript
const STATUS_ICONS = {
	// Buffs
	strength: "game-icons:biceps",
	defense: "game-icons:shield",
	speed: "game-icons:running-ninja",
	regen: "game-icons:healing",

	// Debuffs
	poison: "game-icons:poison-bottle",
	burn: "game-icons:flame",
	freeze: "game-icons:frozen-orb",
	stun: "game-icons:star-swirl",
	bleed: "game-icons:drop",
};
```

**Effort**: ~45 minutes  
**Risk**: Low

### 4.10 Phase 10: TurnTimerText.vue & ActionBar Updates

**File**: `src/components/match/TurnTimerText.vue`

```vue
<template>
	<div v-if="isVisible" class="text-center">
		<span class="text-sm font-semibold text-foreground flex items-center justify-center gap-1">
			<Icon icon="lucide:clock" class="w-4 h-4" />
			TURN TIMER:
			<span :class="seconds < 5 ? 'text-destructive animate-pulse' : 'text-primary'" class="font-mono"> {{ seconds }}s </span>
		</span>
	</div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

defineProps<{
	seconds: number;
	isVisible: boolean;
}>();
</script>
```

**File**: `src/components/match/ActionBar.vue` (Updated)

```vue
<template>
	<div class="bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-lg p-3 space-y-2">
		<!-- Utility Buttons (Run / Pass) -->
		<div class="flex gap-2">
			<button
				@click="emit('action', 'pass')"
				:disabled="!isPlayerTurn"
				class="flex-1 px-3 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-1">
				<Icon icon="lucide:skip-forward" class="w-4 h-4" />
				Pass
			</button>
			<button
				@click="emit('leaveMatch')"
				:disabled="isLeaving"
				class="flex-1 px-3 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center gap-1">
				<Icon icon="lucide:log-out" class="w-4 h-4" />
				{{ isLeaving ? "Leaving..." : "Run" }}
			</button>
		</div>

		<!-- 8-Slot Action Bar -->
		<div class="grid grid-cols-4 sm:grid-cols-8 gap-1">
			<Tooltip v-for="slot in actionSlots" :key="slot.id">
				<TooltipTrigger as-child>
					<button
						@click="handleActionClick(slot)"
						:disabled="!isPlayerTurn"
						:class="[
							'relative aspect-square bg-secondary hover:bg-secondary/80 rounded-md transition-colors flex items-center justify-center p-1 min-h-[44px]',
							slot.isActive && 'ring-2 ring-primary',
							!isPlayerTurn && 'opacity-50 cursor-not-allowed',
						]">
						<Icon :icon="slot.icon" class="w-6 h-6" />
						<!-- Keybind indicator -->
						<span class="absolute bottom-0.5 right-0.5 text-[10px] text-muted-foreground font-mono">
							{{ slot.keybind }}
						</span>
					</button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p class="font-semibold">{{ slot.name }}</p>
					<p class="text-xs text-muted-foreground">{{ slot.description }}</p>
					<p class="text-xs text-muted-foreground mt-1">Hotkey: {{ slot.keybind }}</p>
				</TooltipContent>
			</Tooltip>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useMagicKeys } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const props = defineProps<{
	isLeaving: boolean;
	isPlayerTurn: boolean;
}>();

const emit = defineEmits<{
	leaveMatch: [];
	action: [string];
}>();

interface ActionSlot {
	id: number;
	name: string;
	description: string;
	icon: string;
	keybind: string;
	isActive: boolean;
	actionType: string;
}

const actionSlots = ref<ActionSlot[]>([
	{ id: 1, name: "Attack", description: "Basic physical attack", icon: "game-icons:sword-clash", keybind: "1", isActive: false, actionType: "attack" },
	{ id: 2, name: "Defend", description: "Reduce incoming damage", icon: "game-icons:shield", keybind: "2", isActive: false, actionType: "defend" },
	{ id: 3, name: "Fire", description: "Deal fire damage", icon: "game-icons:flame", keybind: "3", isActive: false, actionType: "fire" },
	{ id: 4, name: "Ice", description: "Deal ice damage", icon: "game-icons:frozen-orb", keybind: "4", isActive: false, actionType: "ice" },
	{ id: 5, name: "Heal", description: "Restore HP", icon: "game-icons:healing", keybind: "5", isActive: false, actionType: "heal" },
	{ id: 6, name: "Buff", description: "Increase stats", icon: "game-icons:biceps", keybind: "6", isActive: false, actionType: "buff" },
	{ id: 7, name: "Item", description: "Use an item", icon: "game-icons:potion-ball", keybind: "7", isActive: false, actionType: "item" },
	{ id: 8, name: "Special", description: "Ultimate ability", icon: "game-icons:star-swirl", keybind: "8", isActive: false, actionType: "special" },
]);

// Keyboard shortcuts using VueUse
const keys = useMagicKeys();

// Watch for 1-8 keys
onMounted(() => {
	for (let i = 1; i <= 8; i++) {
		const keyRef = keys[i.toString()];
		if (keyRef) {
			// Note: This is simplified - actual implementation would use watchEffect
		}
	}
});

function handleActionClick(slot: ActionSlot) {
	if (!props.isPlayerTurn) return;
	emit("action", slot.actionType);
}
</script>
```

**Effort**: ~45 minutes  
**Risk**: Low

### 4.11 Phase 11: Integration & Cleanup

1. **Update `Game.vue`** to use `CombatOverlay` instead of `MatchHUD`
2. **Remove/deprecate** old components (MatchHUD, StatusPanel, TurnTimer)
3. **Test all transitions** and animations
4. **Performance testing** for snappy feel
5. **Accessibility testing** with reduced motion preference

**File**: `src/views/Game.vue`

```vue
<template>
	<div class="game">
		<template v-if="auth.isAuthenticated">
			<DebugConsole />
			<WebSocketManager :auto-connect="autoConnect" />
			<GrimoireOverlay />
		</template>

		<Scene v-if="websocketStore.isConnected" />

		<!-- Combat Overlay (replaces MatchHUD) -->
		<CombatOverlay v-if="websocketStore.isConnected" />
	</div>
</template>

<script setup lang="ts">
// ... existing imports
import CombatOverlay from "@/components/match/CombatOverlay.vue";
// Remove: import MatchHUD from '@/components/match/MatchHUD.vue';
</script>
```

**Effort**: ~30 minutes  
**Risk**: Low

---

## 5. Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Game.vue                                       │
│                                                                             │
│  ┌──────────────────┐  ┌──────────────────────────────────────────────────┐ │
│  │    Scene.vue     │  │              CombatOverlay.vue                   │ │
│  │                  │  │  <Teleport to="body">                            │ │
│  │   3D Canvas      │  │                                                  │ │
│  │   (FROZEN)       │  │    ┌────────────────────────────────────────┐    │ │
│  │                  │  │    │         UnifiedATBBar.vue              │    │ │
│  │  ┌────────────┐  │  │    │  useTransition + Progress + Icon       │    │ │
│  │  │ Overworld  │  │  │    │  [P1 ████░░░░]  ⚔️  [████░░░░ E1]      │    │ │
│  │  │  sprites   │  │  │    └────────────────────────────────────────┘    │ │
│  │  │  remain    │  │  │              TURN TIMER: 15s 🕐                  │ │
│  │  │  in place  │  │  │                                                  │ │
│  │  └────────────┘  │  │    ┌────────────────────────────────────────┐    │ │
│  │                  │  │    │          BattleStage.vue               │    │ │
│  │                  │  │    │   useElementSize (responsive)          │    │ │
│  │                  │  │    │                                        │    │ │
│  │                  │  │    │   ┌──────────┐      ┌──────────┐       │    │ │
│  │                  │  │    │   │<img>     │      │     <img>│       │    │ │
│  │                  │  │    │   │ Player   │      │   Enemy  │       │    │ │
│  │                  │  │    │   │  →       │      │       ←  │       │    │ │
│  │                  │  │    │   └──────────┘      └──────────┘       │    │ │
│  │                  │  │    │   BattleSprite      BattleSprite       │    │ │
│  │                  │  │    │   useImage          useImage           │    │ │
│  │                  │  │    │   CSS animations    CSS animations     │    │ │
│  │                  │  │    └────────────────────────────────────────┘    │ │
│  │                  │  │                                                  │ │
│  │                  │  │    ┌─────────────┐        ┌─────────────────┐    │ │
│  │                  │  │    │PartyStatus  │        │   ActionBar     │    │ │
│  │                  │  │    │useTransition│        │ useMagicKeys    │    │ │
│  │                  │  │    │ Progress    │        │ Tooltip + Icon  │    │ │
│  │                  │  │    │ Tooltip     │        │ [⚔️][🛡️][🔥][❄️]│    │ │
│  │                  │  │    └─────────────┘        └─────────────────┘    │ │
│  └──────────────────┘  └──────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Data Flow: Pinia → Vue Components                       │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        match.store.ts                               │   │
│  │                                                                     │   │
│  │  match.player.health ────→ PartyStatusPanel (HP bar)                │   │
│  │  match.player.readiness ─→ UnifiedATBBar (player ATB)               │   │
│  │  match.npc.health ───────→ triggers enemyAnimationState = 'hurt'    │   │
│  │  match.npc.readiness ────→ UnifiedATBBar (enemy ATB)                │   │
│  │  match.turn.isPlayerTurn → ActionBar (enabled/disabled)             │   │
│  │  match.timer.remaining ──→ TurnTimerText (countdown)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     SceneState (Three.js side)                      │   │
│  │                                                                     │   │
│  │  PVE_MATCH → KinematicMovementComponent.enableMovement = false      │   │
│  │  PVE_MATCH → MatchModule freezes camera                             │   │
│  │  OVERWORLD → Resume movement + camera follow                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 5.1 Architecture Separation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ARCHITECTURE LAYERS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   THREE.JS LAYER (Game Engine)          VUE LAYER (UI/Battle Screen)        │
│   ═══════════════════════════           ════════════════════════════        │
│                                                                             │
│   ┌─────────────────────────┐           ┌─────────────────────────┐         │
│   │ • World rendering       │           │ • CombatOverlay         │         │
│   │ • Physics (Rapier)      │           │ • Battle sprites (img)  │         │
│   │ • Character movement    │           │ • HP/MP/ATB bars        │         │
│   │ • NPC AI                │           │ • Action bar            │         │
│   │ • Collision detection   │           │ • Tooltips              │         │
│   │ • Camera follow         │           │ • CSS animations        │         │
│   │ • Billboard sprites     │           │ • Responsive layout     │         │
│   └─────────────────────────┘           └─────────────────────────┘         │
│              │                                      │                       │
│              │         ┌────────────────┐           │                       │
│              └────────→│  Pinia Store   │←──────────┘                       │
│                        │  (match.store) │                                   │
│                        └────────────────┘                                   │
│                                                                             │
│   COMMUNICATION:                                                            │
│   • SceneState changes trigger both layers                                  │
│   • WebSocket events update Pinia store                                     │
│   • Vue components react to store changes                                   │
│   • Three.js reads store for gameplay state                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. State Flow (Updated)

```
┌─────────────────────────────────────────────────────────────────┐
│                          OVERWORLD                              │
│  • Movement: ✅ Enabled                                         │
│  • Camera: Following player                                     │
│  • UI: Normal overworld HUD                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Double-click NPC with MatchComponent
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MATCH_REQUEST                            │
│  • Movement: ❌ Disabled                                        │
│  • Camera: Frozen                                               │
│  • UI: Loading indicator (optional)                             │
│  • API: createPveMatch() in progress                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API Success
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         PVE_MATCH                               │
│  • Movement: ❌ Disabled (CHANGED)                              │
│  • Camera: Frozen (or subtle zoom - TBD)                        │
│  • UI: CombatOverlay visible with MatchHUD                      │
│  • Arena: Walls + Grid spawned (visual boundary)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Leave Match / Victory
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          OVERWORLD                              │
│  • Movement: ✅ Re-enabled                                      │
│  • Camera: Resume following player                              │
│  • UI: CombatOverlay hidden (transition out)                    │
│  • Arena: Walls + Grid destroyed                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Files Affected

### New Files

| File                                        | Purpose                                 |
| ------------------------------------------- | --------------------------------------- |
| `src/components/match/CombatOverlay.vue`    | Main container with Teleport/Transition |
| `src/components/match/BattleStage.vue`      | Vue-native battle sprite area           |
| `src/components/match/BattleSprite.vue`     | Individual sprite with CSS animations   |
| `src/components/match/UnifiedATBBar.vue`    | All combatants ATB display              |
| `src/components/match/PartyStatusPanel.vue` | Stacked party member status             |
| `src/components/match/StatusEffectIcon.vue` | Buff/debuff icon with tooltip           |
| `src/components/match/TurnTimerText.vue`    | Simple text turn timer                  |
| `src/components/ui/progress/Progress.vue`   | Reusable progress bar                   |
| `src/components/ui/progress/index.ts`       | Progress barrel export                  |

### Modified Files

| File                            | Change Type | Description                                                 |
| ------------------------------- | ----------- | ----------------------------------------------------------- |
| `KinematicMovementComponent.ts` | Modify      | Disable movement in PVE_MATCH                               |
| `MatchModule.ts`                | Simplify    | Camera freeze only (remove arena spawning logic if desired) |
| `ActionBar.vue`                 | Modify      | Remove draggable, add tooltips + icons                      |
| `Game.vue`                      | Modify      | Use CombatOverlay instead of MatchHUD                       |

### Deprecated Files (Keep for Reference)

| File              | Replacement            |
| ----------------- | ---------------------- |
| `MatchHUD.vue`    | `CombatOverlay.vue`    |
| `StatusPanel.vue` | `PartyStatusPanel.vue` |
| `TurnTimer.vue`   | `TurnTimerText.vue`    |

---

## 8. Testing Checklist

### 8.1 Movement Tests

- [ ] Movement disabled when combat starts (PVE_MATCH)
- [ ] Keyboard WASD does not move character during combat
- [ ] Joystick input ignored during combat
- [ ] Movement re-enabled when combat ends (return to OVERWORLD)
- [ ] Jump disabled throughout combat (already working)

### 8.2 Battle Sprite Tests (Vue-Native)

- [ ] Player sprite loads and displays on left side
- [ ] Enemy sprite loads and displays on right side
- [ ] Player sprite faces right, enemy faces left
- [ ] `useImage` preloads sprites (no flicker)
- [ ] Idle animation plays continuously
- [ ] Attack animation triggers on player action
- [ ] Hurt animation triggers when taking damage
- [ ] Victory/defeat animations play on match end
- [ ] `usePreferredReducedMotion` disables animations when enabled
- [ ] Sprites scale responsively on mobile (`useElementSize`)

### 8.3 Camera Tests

- [ ] Camera freezes when combat starts
- [ ] Camera unfreezes when combat ends
- [ ] Camera resumes following player after exit
- [ ] No visual "jump" or jarring transition

### 8.4 UI Animation Tests

- [ ] UnifiedATBBar slides down from top (150ms)
- [ ] BattleStage fades in (150ms)
- [ ] PartyStatusPanel slides in from left (150ms, 25ms delay)
- [ ] ActionBar slides in from right (150ms, 25ms delay)
- [ ] TurnTimerText fades in (150ms, 50ms delay)
- [ ] All elements animate out together on exit (100ms)
- [ ] Animations feel "snappy" - no sluggishness

### 8.5 Component Tests

- [ ] **UnifiedATBBar**: Shows all combatants with correct readiness
- [ ] **UnifiedATBBar**: `useTransition` smooths ATB updates
- [ ] **Progress**: Color changes based on value (health gradient)
- [ ] **PartyStatusPanel**: Shows correct HP/MP values
- [ ] **PartyStatusPanel**: `useTransition` smooths HP/MP drain
- [ ] **PartyStatusPanel**: Tooltips show on status effect hover
- [ ] **TurnTimerText**: Displays correct countdown
- [ ] **TurnTimerText**: Turns red + pulses when < 5 seconds
- [ ] **ActionBar**: Buttons work (1-8 keybinds, Pass, Run)
- [ ] **ActionBar**: Tooltips show ability descriptions
- [ ] **ActionBar**: Icons display correctly (game-icons)
- [ ] **ActionBar**: Disabled state when not player's turn

### 8.6 Integration Tests

- [ ] Match can be initiated via double-click on NPC
- [ ] API calls work as before
- [ ] WebSocket events update all UI components correctly
- [ ] Sprite animation state syncs with match events
- [ ] Leave match works correctly
- [ ] Victory/defeat transitions work correctly
- [ ] Multiple matches in succession work (snappy chain)

### 8.7 Accessibility Tests

- [ ] `usePreferredReducedMotion` respected throughout
- [ ] All interactive elements have proper focus states
- [ ] Tooltips accessible via keyboard
- [ ] Color contrast meets WCAG standards

### 8.8 Performance Tests

- [ ] No frame drops during entry animation
- [ ] No frame drops during exit animation
- [ ] Sprite images cached after first load
- [ ] UI updates don't cause lag
- [ ] Memory cleanup on combat exit (Vue unmount)

---

## 9. Resolved Design Decisions

| Question        | Decision                                                                               |
| --------------- | -------------------------------------------------------------------------------------- |
| Battle sprites  | **Vue-native** - `<img>` with CSS animations, NOT Three.js                             |
| Backdrop        | **No backdrop** - 3D scene fully visible (frozen)                                      |
| Entry Animation | **Slide-in** - Staggered, 150ms, ease-out                                              |
| Exit Animation  | **Fade-out** - All at once, 100ms, ease-in                                             |
| Camera          | **Freeze only** - No zoom needed, Vue overlay covers                                   |
| UI Positioning  | **New layout** - ATB top, BattleStage center, Status bottom-left, Actions bottom-right |
| ActionBar       | **Fixed position** - No dragging, tooltips + icons                                     |
| Arena Dome      | **Optional** - Can keep or remove, Vue overlay is primary                              |
| Combat Log      | **Deferred** - Add in future phase, WebSocket events available                         |
| Progress bars   | **Smooth** - `useTransition` for HP/MP/ATB drain                                       |
| Accessibility   | **Supported** - `usePreferredReducedMotion` for animations                             |

## 9.1 Future Considerations

| Feature          | Notes                                                     |
| ---------------- | --------------------------------------------------------- |
| Party System     | PartyStatusPanel + BattleStage support multiple members   |
| Combat Log       | Parse existing WebSocket events, display in bottom-center |
| Enemy Targeting  | Click sprite or ATB bar segment to select                 |
| Ability Tooltips | Already implemented in ActionBar                          |
| Status Effects   | StatusEffectIcon ready for buff/debuff display            |
| Sprite Sheets    | BattleSprite can be extended for frame-by-frame animation |
| Sound Effects    | Trigger on animation state changes                        |

---

## 10. Implementation Timeline

| Phase  | Task                                  | Effort | Dependencies |
| ------ | ------------------------------------- | ------ | ------------ |
| **1**  | Disable movement during combat        | 5 min  | None         |
| **2**  | Camera freeze (simplified)            | 15 min | None         |
| **3**  | Add Progress component to UI library  | 20 min | None         |
| **4**  | Component architecture setup          | 15 min | None         |
| **5**  | BattleStage.vue (container)           | 30 min | Phase 4      |
| **6**  | BattleSprite.vue (with VueUse)        | 45 min | Phase 4      |
| **7**  | CombatOverlay.vue (main container)    | 1.5 hr | Phases 5-6   |
| **8**  | UnifiedATBBar.vue (with Progress)     | 30 min | Phase 3      |
| **9**  | PartyStatusPanel.vue (with Tooltip)   | 45 min | Phase 3      |
| **10** | TurnTimerText.vue + ActionBar updates | 45 min | None         |
| **11** | Integration & cleanup                 | 30 min | All phases   |
| **12** | Testing & polish                      | 1 hr   | All phases   |

**Total Estimated Effort**: ~7 hours

### Recommended Implementation Order

```
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: Foundation (Parallel)                                 │
│  ├── Movement disable (5 min)                                   │
│  ├── Camera freeze (15 min)                                     │
│  ├── Progress UI component (20 min)                             │
│  └── Component architecture setup (15 min)                      │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 2: Battle Stage (Sequential)                             │
│  ├── BattleStage.vue - container (30 min)                       │
│  └── BattleSprite.vue - animated sprites (45 min)               │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 3: UI Components (Parallel)                              │
│  ├── UnifiedATBBar.vue (30 min)                                 │
│  ├── PartyStatusPanel.vue (45 min)                              │
│  └── TurnTimerText.vue + ActionBar (45 min)                     │
├─────────────────────────────────────────────────────────────────┤
│  PHASE 4: Integration (Sequential)                              │
│  ├── CombatOverlay.vue - wire it all together (1.5 hr)          │
│  ├── Game.vue update (10 min)                                   │
│  └── Testing & polish (1 hr)                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Library Dependencies to Install/Verify

```bash
# Already installed (verify)
bun add @vueuse/core    # useImage, useTransition, useRafFn, etc.
bun add @iconify/vue    # Icon component

# UI components to create
# - src/components/ui/progress/Progress.vue (new)
# - StatusEffectIcon.vue (new)
```

---

## 11. Success Criteria

1. ✅ Movement is completely disabled during combat
2. ✅ Combat appears as an overlay on the overworld (no screen transition feeling)
3. ✅ Battle sprites render via Vue (not Three.js) with CSS animations
4. ✅ All existing combat functionality works (ATB, turns, actions, leave match)
5. ✅ Smooth entry/exit transitions (~150ms)
6. ✅ `useTransition` smooths HP/MP/ATB bar updates
7. ✅ Tooltips show on ActionBar abilities and status effects
8. ✅ Icons display correctly (lucide + game-icons)
9. ✅ Accessibility: `usePreferredReducedMotion` respected
10. ✅ No memory leaks - Vue unmount handles cleanup
11. ✅ Architecture separation maintained (Three.js = world, Vue = UI)

---

## Appendix A: File Structure (After Implementation)

```
src/
├── components/
│   ├── match/
│   │   ├── CombatOverlay.vue       # NEW - Main container (Teleport)
│   │   ├── BattleStage.vue         # NEW - Vue-native battle area
│   │   ├── BattleSprite.vue        # NEW - Animated sprite (CSS)
│   │   ├── UnifiedATBBar.vue       # NEW - All combatants ATB
│   │   ├── PartyStatusPanel.vue    # NEW - Stacked party status
│   │   ├── StatusEffectIcon.vue    # NEW - Buff/debuff icons
│   │   ├── TurnTimerText.vue       # NEW - Simple text timer
│   │   ├── ActionBar.vue           # MODIFIED - Icons + tooltips
│   │   ├── ActionSlot.vue          # NEW - Individual action button
│   │   ├── MatchHUD.vue            # DEPRECATED
│   │   ├── StatusPanel.vue         # DEPRECATED
│   │   └── TurnTimer.vue           # DEPRECATED
│   └── ui/
│       └── progress/               # NEW
│           ├── Progress.vue
│           └── index.ts
├── game/
│   ├── components/
│   │   └── entities/
│   │       └── KinematicMovementComponent.ts  # MODIFIED
│   └── modules/
│       └── scene/
│           └── MatchModule.ts      # SIMPLIFIED - Camera only
├── stores/
│   └── match.store.ts              # Unchanged (data source)
└── views/
    └── Game.vue                    # MODIFIED - Use CombatOverlay
```

## Appendix B: Animation Timing Reference

```
ENTRY SEQUENCE (Total: ~175ms perceived)
═══════════════════════════════════════════════════════════════
0ms    ──┬── Camera freezes
       │    UnifiedATBBar begins slide-down
       │
25ms   ──┼── PartyStatusPanel begins slide-left
       │    ActionBar begins slide-right
       │
50ms   ──┼── BattleStage begins fade-in
       │    TurnTimerText begins fade-in
       │
150ms  ──┼── UnifiedATBBar slide complete
       │
175ms  ──┴── All animations complete
═══════════════════════════════════════════════════════════════

EXIT SEQUENCE (Total: ~100ms)
═══════════════════════════════════════════════════════════════
0ms    ──┬── All UI elements begin fade-out
       │
100ms  ──┴── UI fade-out complete, camera unfreezes
═══════════════════════════════════════════════════════════════

SPRITE ANIMATIONS (CSS)
═══════════════════════════════════════════════════════════════
idle     ── 1s loop, subtle bounce (translateY -4px)
attack   ── 0.3s, lunge forward (translateX 30px)
hurt     ── 0.2s, shake + brightness flash
victory  ── 0.5s, jump + spin
defeat   ── 0.4s, fall over + fade
═══════════════════════════════════════════════════════════════
```

## Appendix C: Library Usage Summary

```typescript
// VueUse (already installed)
import {
	useImage, // BattleSprite - preload sprites
	useTransition, // UnifiedATBBar, PartyStatusPanel - smooth values
	useRafFn, // TurnTimerText - countdown (if needed)
	useElementSize, // BattleStage - responsive scaling
	usePreferredReducedMotion, // BattleSprite - accessibility
	useMagicKeys, // ActionBar - keyboard shortcuts
} from "@vueuse/core";

// Iconify (already installed)
import { Icon } from "@iconify/vue";
// Collections used:
// - lucide: UI icons (heart, clock, swords, etc.)
// - game-icons: RPG icons (flame, shield, potion, etc.)

// Reka UI (existing in src/components/ui/)
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress"; // NEW - to create
```

## Appendix D: Sprite Data Contract

```typescript
// Expected sprite data from match.store or API
interface CombatantSpriteData {
	id: string;
	name: string;
	spriteUrl: string; // Path to sprite image
	animationState: SpriteAnimationState;
}

type SpriteAnimationState = "idle" | "attack" | "hurt" | "victory" | "defeat";

// Future: Sprite sheet support
interface SpriteSheetData {
	url: string;
	frameWidth: number;
	frameHeight: number;
	animations: {
		[key in SpriteAnimationState]: {
			frames: number[];
			frameDuration: number;
			loop: boolean;
		};
	};
}
```

## Appendix E: Related Documentation

- `docs/architecture.md` - Overall game architecture
- `CLAUDE.md` - Project conventions and patterns
- Billboard Sprite System PRD - Related visual system (Three.js side)

---

_Document finalized with Vue-native battle screen approach. Ready for implementation._
