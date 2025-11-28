# Task 1: Match UI Components

**Status**: ✅ COMPLETE (2025-10-31)
**Phase**: [Phase 2 - Combat System Reimplementation](../DASHBOARD.md#phase-2-combat-system-reimplementation)
**Purpose**: Build match arena UI with camera controls, invisible collision boundaries, and visual feedback

---

## Task Overview

Create the visual and interactive components for the match arena, including a fixed camera system, invisible collision walls with visual border indicators, and proper cleanup when returning to overworld mode. This task establishes the player-facing elements of the match environment.

**Why This Task**: Players need clear visual feedback about the match arena boundaries and a consistent camera view. Without proper UI components, players wouldn't understand the match space constraints or have a stable viewing angle.

**Dependencies**:

- **Requires**: Task 1 (Match Environment Setup) - needs SceneStateService and MatchModule infrastructure
- **Blocks**: Task 3 (Combat Mechanics) - combat actions require stable arena and camera

**Estimated Complexity**: Medium (4 iterations expected)

---

## Iterations

### ✅ Iteration 0: Game Mode Controls & Visibility Management

**Goal**: Implement invisible collision walls with visual borders and fixed camera system for match arena

**Status**: ✅ COMPLETE (2025-10-30)

---

#### Brainstorming Session - Match Arena Infrastructure

**Focus**: Design arena boundaries, camera behavior, and visual indicators for match mode

**Subjects to Discuss**:
(All 6 subjects resolved)

**Resolved Subjects**:

---

##### ✅ Subject 1: Movement Limitation

**Decision**: Use invisible collision walls (physics-only GameObjects) around arena perimeter

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Collision walls prevent player from leaving arena without visible obstruction
- Rapier physics engine handles collision detection efficiently
- Invisible walls maintain visual clarity (no ugly barriers blocking view)
- Can show debug wireframes during development via showPhysicsDebug flag

**Resolution Items**:

- Create MatchAreaWalls prefab extending GameObject
- Use CollisionComponent with explicit shape parameters (no mesh required)
- Configure as static physics bodies (immovable walls)
- Support both circular and rectangular arena shapes initially

---

##### ✅ Subject 2: Match Area Definition

**Decision**: Fixed rectangular arena (40 width x 25 depth) centered at NPC position

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Rectangular arena is simpler than circular (4 walls vs 16+ segments)
- Fixed size ensures consistent gameplay every match
- Width > depth fits asymmetric camera viewport better
- Centered at NPC position provides stable anchor point
- 40x25 dimensions fit in camera view without clipping

**Resolution Items**:

- Define fixed arena dimensions: 40 units width (X axis), 25 units depth (Z axis)
- Position arena center at NPC transform position
- Create 4 rectangular walls (North, South, East, West)
- Calculate wall positions based on center + halfWidth/halfDepth offsets

---

##### ✅ Subject 3: Grid System

**Decision**: Faint glowing border lines at ground level (no full grid)

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Full grid clutters the view and distracts from gameplay
- Border lines provide clear visual indication of arena boundaries
- Ground-level positioning prevents z-fighting with terrain
- Faint glow (40% opacity, orange color) is visible but not distracting
- Three.js Line objects are lightweight and performant

**Resolution Items**:

- Create 4 border lines matching wall positions at ground level
- Use LineBasicMaterial with orange color (0xff6b35) and 40% opacity
- Position slightly above ground (Y + 0.05) to prevent z-fighting
- Store line references for manual cleanup on destroy

---

##### ✅ Subject 4: Scene State Management

**Decision**: Use SceneStateService callback system to spawn/cleanup match environment

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Centralized state management prevents scattered state logic
- Callback registration allows modules to react to state changes
- Clean separation between state (SceneStateService) and environment (MatchModule)
- Easy to debug state transitions with centralized logging

**Resolution Items**:

- Register MatchModule callback with SceneStateService
- Spawn walls/camera when transitioning to PVE_MATCH
- Cleanup walls/camera when returning to OVERWORLD
- Use GameObjectManager.unregister() to trigger GameObject.destroy()

---

##### ✅ Subject 5: Camera Control

**Decision**: Fixed Diablo II-style asymmetric camera with frozen position and lookAt

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Fixed camera provides consistent view angle every match
- Asymmetric positioning (offset behind and above center) shows more arena
- Frozen position prevents Vue reactivity from moving camera
- Disabled mouse controls (rotation/zoom) ensure camera stays locked
- Manual position.set() and lookAt() give precise control

**Resolution Items**:

- Add freezeReactiveUpdates flag to useCameraController
- Set camera position at [centerX, 18, centerZ + 18]
- Make camera lookAt [centerX, 2, centerZ] (slightly above ground)
- Freeze reactive updates when entering match (freezeReactiveUpdates = true)
- Disable mouse rotation and zoom (mouseRotationEnabled = false)
- Skip camera.update() in GameScene when frozen
- Unfreeze and re-enable controls when exiting match

---

##### ✅ Subject 6: Match Module Architecture

**Decision**: MatchModule extends SceneModule and manages match-specific GameObjects

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- SceneModule pattern fits existing game architecture
- Module lifecycle (init → update → destroy) handles spawning/cleanup
- Direct access to GameObjectManager for wall registration
- Can reference camera/character from scene context
- State callback registration in init(), cleanup in destroy()

**Resolution Items**:

- Create MatchModule extending SceneModule
- Register state change callback in init()
- Spawn walls when state becomes PVE_MATCH
- Cleanup walls when state returns to OVERWORLD
- Store wall references for cleanup
- Unregister callback in destroy()

---

#### Pre-Implementation Tasks

These tasks were completed BEFORE starting main implementation of this iteration.

---

##### ✅ Pre-Task 1: Update CollisionComponent for Mesh-less Collision

**Completed**: 2025-10-30

**Why Blocking**: MatchAreaWalls needs collision without visible meshes, but CollisionComponent required MeshComponent

**Scope** (< 30 min):

- Add explicit shape registration path to CollisionComponent.init()
- Check for shape + shapeParams before requiring mesh
- Use physics.registerStatic() with explicit dimensions
- Convert shapeParams (half-extents) to full dimensions for Rapier

**Files**:

- `src/game/components/interactions/CollisionComponent.ts` - Add shape-only registration
- `src/game/prefabs/Ground.ts` - Update shapeParams to half-extents
- `src/game/prefabs/MatchAreaWalls.ts` - Use shapeParams without mesh

**Test**: Verify Ground collision still works, walls can register without mesh

**Changes Made**:

- Added conditional in CollisionComponent.init() checking for shape + shapeParams
- Import TransformComponent dynamically to get position/rotation arrays
- Map half-extents to full dimensions (multiply by 2) for registerStatic()
- Updated Ground.ts to use half-extents: `[size/2, 0.1, size/2]`
- MatchAreaWalls now uses TransformComponent + CollisionComponent only (no visual mesh)

---

#### Action Items

(Consolidated from all Resolution Items above)

- [x] Create MatchAreaWalls prefab extending GameObject
- [x] Use CollisionComponent with explicit shape parameters (shape: 'cuboid', shapeParams as half-extents)
- [x] Configure as static physics bodies (type: 'static')
- [x] Define fixed arena dimensions: 40 width (X), 25 depth (Z), 20 height
- [x] Position arena center at NPC transform position
- [x] Create 4 rectangular walls (North, South, East, West)
- [x] Calculate wall positions based on center + halfWidth/halfDepth offsets
- [x] Create 4 border lines matching wall positions at ground level
- [x] Use LineBasicMaterial with orange color (0xff6b35) and 40% opacity
- [x] Position lines slightly above ground (Y + 0.05) to prevent z-fighting
- [x] Store line references for manual cleanup on destroy
- [x] Register MatchModule callback with SceneStateService
- [x] Spawn walls/camera when transitioning to PVE_MATCH
- [x] Cleanup walls/camera when returning to OVERWORLD
- [x] Use GameObjectManager.unregister() to trigger GameObject.destroy()
- [x] Add freezeReactiveUpdates flag to useCameraController composable
- [x] Set camera position at [centerX, 18, centerZ + 18]
- [x] Make camera lookAt [centerX, 2, centerZ]
- [x] Freeze reactive updates when entering match
- [x] Disable mouse rotation and zoom during match
- [x] Skip camera.update() in GameScene when frozen
- [x] Unfreeze and re-enable controls when exiting match
- [x] Create MatchModule extending SceneModule
- [x] Register state change callback in MatchModule.init()
- [x] Spawn walls in callback when state = PVE_MATCH
- [x] Cleanup walls in callback when state = OVERWORLD
- [x] Unregister callback in MatchModule.destroy()
- [x] Fix border line cleanup (manually remove/dispose in MatchAreaWalls.destroy())

---

#### Implementation - Iteration 0: Game Mode Controls & Visibility Management

**Status**: ✅ COMPLETE (2025-10-30)

**Implementation Notes**:

- Created `MatchAreaWalls` prefab with 4 invisible collision walls
    - Uses CollisionComponent with explicit shapeParams (half-extents)
    - Creates 4 border lines (Three.js Line) at ground level
    - Manual cleanup in destroy() to remove lines from scene
- Updated `CollisionComponent` to support mesh-less collision
    - Checks for shape + shapeParams before requiring mesh
    - Converts half-extents to full dimensions for physics registration
    - Uses TransformComponent.getPositionArray() / getRotationArray()
- Added `freezeReactiveUpdates` flag to camera system
    - Stops watchEffect in useCamera when frozen
    - Prevents camera from following player during matches
    - Skip camera.update() in GameScene.update() when frozen
- Disabled mouse controls during match
    - mouseRotationEnabled = false disables rotation
    - Zoom check in useCameraMouseInput checks enabled flag
- Fixed camera positioning
    - Manual position.set() and lookAt() instead of changeTarget()
    - Camera at [centerX, 18, centerZ + 18]
    - LookAt [centerX, 2, centerZ]
- Arena architecture changed from circular to rectangular
    - Initial circular design had gaps between segments
    - Simplified to 4 rectangular walls (North, South, East, West)
    - Dimensions: 40 width x 25 depth (fits camera viewport)
- Border line cleanup issue discovered and fixed
    - Lines registered with scene CleanupRegistry persisted after GameObject destroy
    - Added manual removal in MatchAreaWalls.destroy()
    - Dispose geometry and material to prevent memory leaks

**Files Modified**:

- `src/game/prefabs/MatchAreaWalls.ts` - Created (238 lines)
- `src/game/modules/scene/MatchModule.ts` - Created (280 lines)
- `src/game/services/SceneStateService.ts` - Created (145 lines)
- `src/game/components/interactions/CollisionComponent.ts` - Updated (+30 lines)
- `src/composables/useCameraController.ts` - Added freezeReactiveUpdates flag
- `src/composables/useCamera.ts` - Check freeze flag in watchEffect
- `src/composables/useCameraMouseInput.ts` - Check enabled flag for zoom
- `src/composables/composables.types.ts` - Added freezeReactiveUpdates to interface
- `src/game/GameScene.ts` - Skip camera.update() when frozen
- `src/game/common/scenes.types.ts` - Added I_ModuleContext.services type

**Verification**:

- ✅ Border lines appear when entering match
- ✅ Border lines are faint orange glow at ground level
- ✅ Collision walls are invisible (no mesh)
- ✅ Collision walls block player movement
- ✅ Camera position is fixed (no following, no zoom/rotation)
- ✅ Camera looks at arena center
- ✅ Arena dimensions are consistent (40x25)
- ✅ Border lines disappear when exiting match
- ✅ No memory leaks (lines properly disposed)
- ✅ Full integration test with match start/end cycle

**Known Issues**:

- None - all issues from development session resolved

---

### ✅ Iteration 1: Match HUD Elements

**Goal**: Create match HUD with timer, player status, and action buttons

**Status**: ✅ COMPLETE (2025-10-31)

**Brainstorming Status**: ✅ COMPLETE
**Pre-Implementation Tasks**: N/A (no blockers identified)
**Implementation Started**: 2025-10-31

---

#### Brainstorming Session - Match HUD Elements

**Focus**: Design comprehensive match HUD with timer, status indicators, and action buttons

**Subjects to Discuss** (tackle one at a time):

1. ✅ **Component Architecture** - Vue components vs Three.js overlays?
2. ✅ **HUD Layout & Positioning** - Where elements should be placed on screen
3. ✅ **HUD Visibility Management** - Show/hide with match state
4. ✅ **Theme Integration** - Light/dark mode support
5. ✅ **Responsive Design** - Mobile vs desktop layouts
6. ✅ **Match Timer Design** - Countdown vs count-up, when to start/stop
7. ✅ **Player Status Indicators** - What info to show: name, level, portrait?
8. ✅ **Action Buttons Structure** - Attack, abilities, defend, flee?

**Resolved Subjects**:

---

##### ✅ Subject 1: Component Architecture

**Decision**: Use pure Vue 3 components with Reka UI (shadcn-vue) and Tailwind CSS for all Match HUD elements

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Vue 3 wraps the game specifically to leverage powerful HTML/CSS/JS capabilities for UI
- Reka UI provides accessible, unstyled primitives (shadcn-vue foundation)
- Tailwind CSS offers utility-first styling with full theming support
- Existing `MatchHUD.vue` already demonstrates this pattern successfully
- DOM-based UI is familiar, maintainable, and provides rich styling options
- Better for web-based games compared to Three.js canvas rendering

**Action Items**:

- [ ] Refactor existing `src/components/match/MatchHUD.vue` to be the base container component
- [ ] Create child components for each HUD section (timer, status, actions)
- [ ] Maintain existing visibility pattern: `computed(() => matchStore.currentMatchId !== null)`
- [ ] Keep MatchHUD loaded at all times in `src/views/Game.vue` (already in place)
- [ ] Use component composition pattern (parent container + child feature components)

---

##### ✅ Subject 2: HUD Layout & Positioning

**Decision**: Pokemon-inspired three-corner layout with symmetry and clear call-to-action focus

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Pokemon battle UI is proven, clean, and instantly understandable
- Simple and clean design keeps center screen clear for gameplay
- Three-corner layout creates natural visual balance:
    - **Bottom-left**: Player health bar (like Pokemon's player status)
    - **Top-right**: Enemy health bar (symmetric opposite)
    - **Bottom-right**: Action buttons (clear call-to-action positioning)
- Keeps gameplay center unobstructed
- Natural reading flow (left = player, right = enemy/actions)
- Mobile-friendly corner anchoring

**Layout Specification**:

- **Bottom-left corner**: Player status panel (name, level, HP/MP bars, portrait, **ATB bar**)
- **Top-right corner**: Enemy status panel (name, level, HP bar, **ATB bar**)
- **Bottom-right corner**: Action buttons (attack, abilities, items, flee)
- **Top-center**: **Turn Timer bar** (shared element, shows whose turn + time remaining)
- **Center**: Clear for gameplay and visual effects

**ATB System Integration**:

- **ATB Bar** (per-character): Shows "waiting for turn" progress, attached to each character's status panel
    - Fills gradually as character waits their turn
    - Visual indicator of turn order
    - Located within player (bottom-left) and enemy (top-right) status panels
- **Turn Timer Bar** (shared/global): Shows active turn time limit, positioned top-center
    - Only visible during active turn (player's or enemy's)
    - Counts down from max turn time to zero
    - Should share visual similarities with ATB bar (same style/theme)
    - Clearly indicates whose turn it is (player vs enemy color coding)

**Action Items**:

- [ ] Position player status component in bottom-left corner with integrated ATB bar
- [ ] Position enemy status component in top-right corner with integrated ATB bar
- [ ] Position action buttons in bottom-right corner
- [ ] Add Turn Timer bar at top-center (shared element for active turn)
- [ ] Design ATB bar visual style (progress indicator within status panels)
- [ ] Design Turn Timer bar to match ATB bar aesthetic (consistent theming)
- [ ] Use fixed positioning for corner anchoring
- [ ] Ensure adequate padding from screen edges (safe zones)
- [ ] Add color coding for Turn Timer (player color vs enemy color)

---

##### ✅ Subject 3: HUD Visibility Management

**Decision**: Keep current simple show/hide approach (v-if based on matchStore.currentMatchId)

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Existing implementation already works: `v-if="matchStore.currentMatchId !== null"`
- Simple and reliable with zero complexity
- Easily modified later if transitions/animations are desired
- No performance overhead or timing issues
- Focus development effort on core HUD functionality first
- Polish (animations) can be added in future iterations

**Action Items**:

- [ ] Keep existing visibility pattern in MatchHUD.vue (no changes needed)
- [ ] Document that transitions can be added later if desired (not blocking)

---

##### ✅ Subject 4: Theme Integration

**Decision**: Use existing Tailwind semantic theme variables for automatic light/dark mode support

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- HUD should match the overall app theme for consistency
- Semantic color classes (`bg-background`, `text-foreground`, `border-border`, etc.) automatically adapt
- Zero extra configuration needed - leverages existing theme system
- User experience is cohesive across entire app
- Project already has VueUse `useColorMode()` and CSS variables set up
- Simpler maintenance - one theming system, not two

**Action Items**:

- [ ] Use Tailwind semantic color classes for all HUD components
- [ ] Use `bg-background/70` or `bg-card` for HUD panel backgrounds
- [ ] Use `text-foreground` for primary text, `text-muted-foreground` for secondary
- [ ] Use `border-border` for panel borders
- [ ] Use theme-aware accent colors: `bg-primary`, `text-primary`, etc.
- [ ] Test HUD appearance in both light and dark modes

---

##### ✅ Subject 5: Responsive Design

**Decision**: Use Tailwind responsive breakpoints to scale HUD elements (same layout, adaptive sizing)

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Project is already mobile-first with virtual joystick support
- Pokemon UI reference scales well across device sizes (same layout, different scales)
- Tailwind breakpoints (`sm:`, `md:`, `lg:`) make this trivial to implement
- Three-corner layout works on any screen size - only needs size adjustments, not restructuring
- Balanced effort/value: not too basic (Option 1) nor too complex (Options 3/4)
- Can selectively hide elements later (portraits on mobile) if needed without major refactoring

**Responsive Strategy**:

- **Mobile** (default): Smaller HP bars, compact buttons, minimal padding, smaller text
- **Tablet** (`md:`): Medium sizing with comfortable spacing
- **Desktop** (`lg:`): Full-size panels with generous spacing and larger text

**Action Items**:

- [ ] Use responsive text sizing: `text-sm md:text-base lg:text-lg`
- [ ] Use responsive padding: `p-2 md:p-4 lg:p-6`
- [ ] Use responsive spacing: `space-y-1 md:space-y-2 lg:space-y-3`
- [ ] Scale HP/MP bar heights: `h-2 md:h-3 lg:h-4`
- [ ] Scale button sizes: `text-xs md:text-sm lg:text-base`
- [ ] Test on mobile, tablet, and desktop viewports
- [ ] Ensure touch targets are adequate on mobile (min 44x44px)

---

##### ✅ Subject 6: Match Timer Design

**Decision**: ATB bars count up (filling), Turn Timer counts down (deadline pressure)

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- **ATB Bar (count up)**: Fills gradually from 0% → 100%, building anticipation for turn
- **Turn Timer (countdown)**: Starts at max (e.g., 10 seconds), counts down to 0, creating action urgency
- Clear gameplay rhythm: "Build up your turn, then act quickly"
- Intuitive visual language: filling = waiting, draining = acting
- Countdown creates healthy pressure without being overwhelming
- Matches established ATB game conventions (Final Fantasy, Grandia)

**Timer Behavior**:

- **ATB Bar**: Gradually fills based on character speed/tempo stats
- **Turn Timer**: Appears when turn starts, counts down from configurable limit (default: 10 seconds)
- **On Timeout**: Auto-pass turn or execute default action (design decision for later)
- **Visual Feedback**: Warning state when < 3 seconds remaining (color change, pulse animation)

**Action Items**:

- [ ] Implement ATB bar as fill progress (0% → 100%)
- [ ] Implement Turn Timer as countdown (10s → 0s)
- [ ] Display Turn Timer at top-center when turn is active
- [ ] Add visual warning state for Turn Timer < 3 seconds
- [ ] Color-code Turn Timer (player color vs enemy color)
- [ ] Hide Turn Timer when no active turn
- [ ] Define timeout behavior (auto-pass or default action)

---

##### ✅ Subject 7: Player Status Indicators

**Decision**: Pokemon-style simple status panel (name, level, HP bar, MP bar placeholder) with creative ATB integration

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- Keep it simple and clean like Pokemon reference
- HP bar (red/green gradient) with current/max numbers
- MP bar (blue) as placeholder for future mana system
- Name and level prominently displayed
- Both player (bottom-left) and enemy (top-right) use same format for symmetry
- ATB bar needs visual integration - to be determined during implementation

**Status Panel Contents**:

- **Character name** (top of panel)
- **Level indicator** (e.g., "Lv. 7")
- **HP bar** (red/green, with numbers: "23/23")
- **MP bar** (blue, placeholder, with numbers: "0/0" initially)
- **ATB bar** (integrated visually - implementation detail to explore)

**ATB Bar Integration Options** (to be decided during implementation):

- Option A: Separate horizontal bar below HP/MP
- Option B: Panel border that fills and changes color as ATB charges
- Option C: Glow effect around entire panel that intensifies
- Option D: Small circular progress indicator
- **Decision deferred** - experiment during implementation to see what looks/feels best

**Action Items**:

- [ ] Create status panel component with name, level, HP bar, MP bar
- [ ] Use HP bar with red/green gradient (theme-aware colors)
- [ ] Use MP bar with blue gradient (placeholder for future)
- [ ] Display current/max numbers on bars (e.g., "23/23")
- [ ] Apply same design to both player and enemy panels (symmetric)
- [ ] Experiment with ATB bar visual integration during implementation
- [ ] Choose ATB visualization that feels natural and doesn't clutter

---

##### ✅ Subject 8: Action Buttons Structure

**Decision**: Horizontal MMO-style action bar (8 slots + 2 utility actions) with keyboard bindings, drag-and-drop repositioning, and localStorage persistence

**Resolution Type**: D (Iteration Action Items)

**Rationale**:

- **Speed matters**: 10-second turn timer means clicks/keypresses must be minimal
- **Horizontal layout**: Better for quick scanning than Pokemon's vertical list
- **Keyboard bindings** (1-8): Fast action execution for desktop players
- **Touch-friendly**: Large clickable buttons for mobile
- **MMO influence**: Proven hotbar pattern familiar to many players
- **Draggable**: Players can position where comfortable, saved to localStorage
- **VueUse composable**: `useLocalStorage` for position persistence (no Pinia store needed)
- **Component-based**: Self-contained logic within MatchHUD component tree

**Action Bar Structure**:

- **8 ability slots** (horizontal row):
    - Mapped to keyboard keys 1-8
    - Clickable/tappable for mouse/touch
    - All show "Attack" initially (skills not yet implemented)
    - Each slot shows: ability icon, name, keybind number
- **2 utility actions** (positioned above action bar):
    - **"Run"** button: Uses existing "Leave Match" logic from current MatchHUD
    - **"Pass"** button: Sends pass action to skip turn
- **Default position**: Bottom-right corner
- **Draggable handle**: Click and drag to reposition entire action bar
- **Position persistence**: Saved to localStorage via `useLocalStorage`

**Technical Implementation**:

- Component hierarchy: `MatchHUD.vue` → `ActionBar.vue` component
- No Pinia store for HUD logic (keep it component-local)
- Use VueUse `useLocalStorage('actionBarPosition', { x: default, y: default })`
- Use VueUse `useDraggable` for drag-and-drop functionality
- Keyboard event listeners (1-8 keys) within ActionBar component
- Responsive sizing via Tailwind breakpoints

**Action Items**:

- [ ] Create `ActionBar.vue` component in `src/components/match/`
- [ ] Implement horizontal 8-slot layout with keyboard bindings (1-8)
- [ ] Add "Run" button (reuse existing leave match logic)
- [ ] Add "Pass" button (send pass action)
- [ ] Use VueUse `useDraggable` for drag-and-drop repositioning
- [ ] Use VueUse `useLocalStorage` to persist position
- [ ] Default position: bottom-right corner with safe padding
- [ ] Show "Attack" placeholder in all 8 slots initially
- [ ] Add visual feedback for keyboard shortcuts (show "1-8" on buttons)
- [ ] Ensure touch targets are adequate for mobile (min 44x44px)
- [ ] Add drag handle indicator (grip icon or visual cue)
- [ ] Import ActionBar into MatchHUD.vue component

---

#### Action Items

(Consolidated from all Resolution Items above by `/flow-brainstorm-review`)

**Component Architecture:**

- [x] Refactor existing `src/components/match/MatchHUD.vue` to be the base container component
- [x] Create child components for each HUD section (timer, status, actions)
- [x] Maintain existing visibility pattern: `computed(() => matchStore.currentMatchId !== null)`
- [x] Keep MatchHUD loaded at all times in `src/views/Game.vue` (already in place)
- [x] Use component composition pattern (parent container + child feature components)

**Layout & Positioning:**

- [x] Position player status component in bottom-left corner with integrated ATB bar
- [x] Position enemy status component in top-right corner with integrated ATB bar
- [x] Position action buttons in bottom-right corner
- [x] Add Turn Timer bar at top-center (shared element for active turn)
- [x] Design ATB bar visual style (progress indicator within status panels)
- [x] Design Turn Timer bar to match ATB bar aesthetic (consistent theming)
- [x] Use fixed positioning for corner anchoring
- [x] Ensure adequate padding from screen edges (safe zones)
- [x] Add color coding for Turn Timer (player color vs enemy color)

**Visibility Management:**

- [x] Keep existing visibility pattern in MatchHUD.vue (no changes needed)
- [x] Document that transitions can be added later if desired (not blocking)

**Theme Integration:**

- [x] Use Tailwind semantic color classes for all HUD components
- [x] Use `bg-background/70` or `bg-card` for HUD panel backgrounds
- [x] Use `text-foreground` for primary text, `text-muted-foreground` for secondary
- [x] Use `border-border` for panel borders
- [x] Use theme-aware accent colors: `bg-primary`, `text-primary`, etc.
- [x] Test HUD appearance in both light and dark modes

**Responsive Design:**

- [x] Use responsive text sizing: `text-sm md:text-base lg:text-lg`
- [x] Use responsive padding: `p-2 md:p-4 lg:p-6`
- [x] Use responsive spacing: `space-y-1 md:space-y-2 lg:space-y-3`
- [x] Scale HP/MP bar heights: `h-2 md:h-3 lg:h-4`
- [x] Scale button sizes: `text-xs md:text-sm lg:text-base`
- [x] Test on mobile, tablet, and desktop viewports
- [x] Ensure touch targets are adequate on mobile (min 44x44px)

**Timer Design:**

- [x] Implement ATB bar as fill progress (0% → 100%)
- [x] Implement Turn Timer as countdown (10s → 0s)
- [x] Display Turn Timer at top-center when turn is active
- [x] Add visual warning state for Turn Timer < 3 seconds
- [x] Color-code Turn Timer (player color vs enemy color)
- [x] Hide Turn Timer when no active turn
- [x] Define timeout behavior (auto-pass or default action)

**Status Indicators:**

- [x] Create status panel component with name, level, HP bar, MP bar
- [x] Use HP bar with red/green gradient (theme-aware colors)
- [x] Use MP bar with blue gradient (placeholder for future)
- [x] Display current/max numbers on bars (e.g., "23/23")
- [x] Apply same design to both player and enemy panels (symmetric)
- [x] Experiment with ATB bar visual integration during implementation
- [x] Choose ATB visualization that feels natural and doesn't clutter

**Action Buttons:**

- [x] Create `ActionBar.vue` component in `src/components/match/`
- [x] Implement horizontal 8-slot layout with keyboard bindings (1-8)
- [x] Add "Run" button (reuse existing leave match logic)
- [x] Add "Pass" button (send pass action)
- [x] Use VueUse `useDraggable` for drag-and-drop repositioning
- [x] Use VueUse `useLocalStorage` to persist position
- [x] Default position: bottom-right corner with safe padding
- [x] Show "Attack" placeholder in all 8 slots initially
- [x] Add visual feedback for keyboard shortcuts (show "1-8" on buttons)
- [x] Ensure touch targets are adequate on mobile (min 44x44px)
- [x] Add drag handle indicator (grip icon or visual cue)
- [x] Import ActionBar into MatchHUD.vue component

---

#### Implementation - Iteration 1: Match HUD Elements

**Status**: ✅ COMPLETE (2025-10-31)

**Action Items**: See Action Items section above (59 items consolidated from brainstorming)

**Implementation Notes**:

**Component Architecture - MVP Complete**:

- Refactored `MatchHUD.vue` to Pokemon-inspired three-corner layout container
- Created `TurnTimer.vue` (top-center) - countdown timer with color-coding and warning states
- Created `StatusPanel.vue` (reusable for player/enemy) - name, level, HP/MP/ATB bars with gradients
- Created `ActionBar.vue` (bottom-right) - 8-slot horizontal hotbar with keyboard bindings (1-8), Run/Pass buttons, draggable via VueUse, position persisted to localStorage

**Layout Refinements**:

- All top elements use `mt-16` to clear menu bar (Turn Timer, Enemy Status)
- Player status uses `mb-16` for symmetry with enemy panel
- `pointer-events-none` on container, `pointer-events-auto` on children for click-through
- Consistent spacing and positioning across all corners

**Design Decisions**:

- All components use Tailwind semantic classes for automatic theme support
- Placeholder data hardcoded (will connect to match state in future iteration)
- Responsive breakpoints: `sm:` for mobile, base for desktop
- Touch-friendly: min 44x44px touch targets on mobile
- HP bar gradients: green → yellow → red based on percentage
- MP bar: blue gradient
- ATB bar: color-coded by entity type (player = primary, enemy = destructive)

**Testing**:

- Auto-match debug feature works with new scene hooks
- HUD renders correctly in match state
- Layout is clean and unobtrusive
- Components are properly scoped and isolated

**Files Modified**:

- `src/components/match/MatchHUD.vue` - Refactored as container (135 lines)
- `src/components/match/TurnTimer.vue` - Created (71 lines)
- `src/components/match/StatusPanel.vue` - Created (104 lines)
- `src/components/match/ActionBar.vue` - Created (149 lines)

**Verification**:

- ✅ HUD appears when entering match (auto-match works)
- ✅ Three-corner layout renders correctly
- ✅ No menu overlap (top elements use mt-16)
- ✅ Symmetric positioning (top-right enemy, bottom-left player)
- ✅ Action bar is draggable and persists position
- ✅ Keyboard shortcuts (1-8) registered
- ✅ Run button triggers leave match
- ✅ Components use semantic theme classes
- ✅ Responsive layout adapts to viewport size
- ✅ Touch targets adequate on mobile (min 44x44px)

---

### ❌ Iteration 2: Character Status Display

**Goal**: Show character health, mana, and status effects in match UI

**Status**: ❌ CANCELLED

**Reason**: Consolidated into Iteration 1 during brainstorming. Character status display (name, level, HP/MP bars, ATB integration) is fully covered in Iteration 1's comprehensive Match HUD design.

**Note**: Status effects (buffs/debuffs) not yet designed - can be added as future iteration if needed.

---

### ❌ Iteration 3: Combat Actions UI

**Goal**: Implement attack/ability buttons and targeting indicators

**Status**: ❌ CANCELLED

**Reason**: Consolidated into Iteration 1 during brainstorming. Action bar with 8 ability slots, keyboard bindings (1-8), Run/Pass buttons, and draggable positioning is fully covered in Iteration 1's action items.

**Note**: Targeting indicators not yet designed - can be added as future iteration if needed.

---

## Task Notes

**Discoveries**:

- Circular arena math was complex and error-prone (gaps between wall segments)
- Rectangular arena is much simpler and fits camera viewport better
- GameObject.destroy() doesn't trigger scene-level CleanupRegistry cleanup
- Border lines must be manually removed/disposed in destroy() method
- TransformComponent stores position/rotation as Vector3/Euler, not arrays
- Camera watchEffect must check freeze flag to prevent reactive updates
- Half-extents convention is standard for physics (Rapier expects this)

**Decisions**:

- Rectangular arena (40x25) instead of circular - simpler and more practical
- Fixed camera position instead of following - matches Diablo II style
- Manual border line cleanup instead of relying on CleanupRegistry - more explicit and reliable
- Half-extents convention for shapeParams - matches physics engine expectations
- Faint orange border lines instead of solid walls - clear but not distracting

**Performance**:

- Border line creation: ~5ms (4 lines with geometry + material)
- Wall collision registration: ~10ms (4 static bodies)
- Camera freeze/unfreeze: <1ms (flag toggle)
- Border line cleanup: ~2ms (4 removes + dispose calls)

**References**:

- Flow Task Template: `.flow/framework/examples/phase-2/task-3.md`
- CollisionComponent: `src/game/components/interactions/CollisionComponent.ts`
- PhysicsService: `src/game/services/PhysicsService.ts`
- Camera Composables: `src/composables/useCamera.ts`, `src/composables/useCameraController.ts`
