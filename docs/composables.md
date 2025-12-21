# Composables Architecture

## Two-Layer Pattern

Composables are split into two categories for testability and separation of concerns.

### Entity Composables

Own Three.js instances. Create and manage actual 3D objects.

| Composable | Owns |
|------------|------|
| `useCamera` | PerspectiveCamera instance |
| `useCharacter` | Character mesh, animations |
| `useEnvironment` | Scene lighting, skybox |

```typescript
// Entity composable - creates Three.js objects
export function useCamera(scene: Scene) {
  const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
  
  onUnmounted(() => {
    // Cleanup
  });
  
  return { camera };
}
```

### Controller Composables

Pure state and logic. No Three.js dependencies.

| Composable | Controls |
|------------|----------|
| `useCameraController` | Orbit, follow, zoom logic |
| `useCharacterController` | Movement state, input handling |
| `useMatchController` | Combat flow, turn logic |

```typescript
// Controller composable - pure logic
export function useCameraController() {
  const distance = ref(10);
  const angle = ref(0);
  
  function orbit(delta: number) {
    angle.value += delta;
  }
  
  function zoom(amount: number) {
    distance.value = clamp(distance.value + amount, 5, 20);
  }
  
  return { distance, angle, orbit, zoom };
}
```

### Why Separate?

1. **Testability**: Controller composables can be unit tested without Three.js
2. **Reusability**: Same controller logic works with different entity implementations
3. **SSR Safety**: Controllers work in SSR context; entities are client-only

---

## Common Composables

### useCamera

Creates and manages the main camera.

```typescript
const { camera, setPosition, lookAt } = useCamera(scene);

setPosition(0, 5, 10);
lookAt(0, 0, 0);
```

### useCameraController

Orbital camera controls.

```typescript
const { 
  distance, 
  azimuth, 
  polar,
  orbit,
  zoom,
  follow 
} = useCameraController();

// In update loop
orbit(mouseDelta);
follow(playerPosition);
```

### useCharacter

Player character mesh and animations.

```typescript
const { 
  mesh, 
  playAnimation, 
  setPosition,
  getPosition 
} = useCharacter(scene);

playAnimation('walk');
setPosition(5, 0, 3);
```

### useCharacterController

Movement input and state.

```typescript
const {
  velocity,
  isMoving,
  isJumping,
  move,
  jump,
  stop
} = useCharacterController();

// In input handler
if (keys.w) move('forward');
if (keys.space) jump();
```

### useTheme

Light/dark mode integration with VueUse.

```typescript
const { isDark, toggle, set } = useTheme();

toggle();  // Switch theme
set('dark');  // Force theme
```

---

## Loading System

Uses RxJS from topsyde-utils for async loading coordination.

### Scene Side

```typescript
// In GameScene
this.loadingSubject.next({ type: 'start', totalAssets: 5 });

// As assets load
this.loadingSubject.next({ type: 'loaded', count: 1 });
this.loadingSubject.next({ type: 'loaded', count: 2 });

// Module ready notification
this.initialized('PlaygroundScene');
```

### UI Side

```typescript
// In LoadingScreen.vue
const { progress, message, isLoading } = useLoading();

// progress: 0-100
// message: Current loading status
// isLoading: Boolean for show/hide
```

### Events

| Event | Payload | When |
|-------|---------|------|
| `start` | `{ totalAssets }` | Loading begins |
| `loaded` | `{ count }` | Asset finished loading |
| `fail` | `{ error, asset }` | Asset failed to load |
| `complete` | - | All assets loaded |

---

## Best Practices

### Prefer VueUse

Always check VueUse before writing custom composables:

```typescript
// ❌ Don't write custom
function useWindowSize() { ... }

// ✅ Use VueUse
import { useWindowSize } from '@vueuse/core';
```

### Cleanup in onUnmounted

```typescript
export function useMyComposable() {
  const subscription = someObservable.subscribe();
  
  onUnmounted(() => {
    subscription.unsubscribe();
  });
}
```

### Provide Context Type

```typescript
export function useMyComposable(context: I_SceneContext) {
  // Type-safe access to scene, services, cleanup
}
```

### Return Readonly When Appropriate

```typescript
export function useCounter() {
  const count = ref(0);
  
  return {
    count: readonly(count),  // External can't mutate
    increment: () => count.value++,
  };
}
```