# Code Audit Report
**Generated**: 2026-01-17
**Project**: RUNE RPG Client (client_rune_dictionary)
**Auditor**: code-architect subagent

## Executive Summary

The RUNE RPG client demonstrates **excellent architectural design** with a well-structured Entity-Component-System (ECS) pattern for the Three.js game engine layer, clean separation between Vue UI and game logic, and thoughtful memory management. The codebase shows mature software engineering practices including trait-based component discovery, priority-ordered initialization, and comprehensive cleanup registries.

However, the audit identified **critical security vulnerabilities** that must be addressed before any production deployment. Most notably, credentials are hardcoded in source files and stored in localStorage without encryption. The codebase also contains excessive console logging (201 occurrences across 63 files) that should be conditionally compiled out for production builds.

**Overall Health Score: 7/10** - Strong architecture, critical security fixes needed

## Tech Stack

- **Language(s)**: TypeScript 5.9, Vue 3.5
- **Framework(s)**: Vue 3 (Composition API), Three.js 0.180, Rapier3D 0.19 (WASM)
- **Package Manager**: Bun
- **Build Tool**: Vite 7
- **State Management**: Pinia 3 with persistedstate plugin
- **UI Library**: Reka UI 2.6 + Tailwind CSS 4.1
- **Utilities**: VueUse 14.1, topsyde-utils

---

## Critical Issues (Must Fix Before Deploy)

### Security

#### 1. CRITICAL: Hardcoded Credentials in Source Code
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/stores/auth.store.ts:9-10`
**Severity**: CRITICAL

```typescript
// Current (problematic)
const username = useLocalStorage("auth_username", "admin");
const password = useLocalStorage("auth_password", "r_d_25c9dd62-ba12-44de-b303-67ef659ba7bd");

// Suggested fix
const username = useLocalStorage("auth_username", "");
const password = useLocalStorage("auth_password", "");
// Never store default credentials - let user input them
```

**Impact**: Anyone with access to the source code or built JS bundles can extract the default admin password.

---

#### 2. CRITICAL: Hardcoded User Credentials in Login Component
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/views/Login.vue:113-116`
**Severity**: CRITICAL

```typescript
// Current (problematic)
const admin_users = [
    { username: "tal", password: "Aa123123" },
    { username: "yazin", password: "r_d_0733e6dd-f421-46cf-bf8a-72a2898f91e6" },
];

// Suggested fix - Remove entirely or guard with build-time flags
const admin_users: Array<{username: string, password: string}> = [];
if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_ACCOUNTS) {
    // Load from .env.local (never committed)
    admin_users.push({
        username: import.meta.env.VITE_DEV_USER_1 || '',
        password: import.meta.env.VITE_DEV_PASS_1 || ''
    });
}
```

**Impact**: Real user passwords exposed in source code, version control, and production bundles.

---

#### 3. HIGH: Credentials Stored in localStorage Without Encryption
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/stores/auth.store.ts`
**Severity**: HIGH

```typescript
// Current (problematic)
const authToken: Ref<string | null> = useLocalStorage("auth_token", null);
const expiresAt: Ref<number | null> = useLocalStorage("auth_expires_at", null);

// Suggested fix - Use session storage or encrypted storage
// For session-based auth:
const authToken = ref<string | null>(sessionStorage.getItem("auth_token"));

// Or use a library like secure-ls for encrypted localStorage
import SecureLS from "secure-ls";
const ls = new SecureLS({ encodingType: 'aes' });
```

**Impact**: Any XSS vulnerability or browser extension can read stored credentials.

---

### Code Practices

#### 4. HIGH: No `$reset()` Function in auth.store.ts
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/stores/auth.store.ts`
**Severity**: HIGH

```typescript
// Current (problematic)
// Missing $reset() function - DataStore.resetAll() will fail silently

// Suggested fix
function $reset() {
    username.value = "";
    password.value = "";
    authToken.value = null;
    expiresAt.value = null;
}

return {
    // ... existing exports
    $reset,
};
```

---

#### 5. MEDIUM: @ts-ignore Used to Access Private Method - FIXED
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/scenes/PlaygroundScene.ts:482-483`
**Severity**: MEDIUM

```typescript
// Current (problematic)
// @ts-ignore - Accessing private method for debug purposes
await matchComponent.handleMatchCreation(this.getSceneContext());

// Suggested fix - Make method public or create a debug interface
// Option 1: Make method public with clear naming
public createMatchForDebug(context: I_SceneContext): Promise<void> {
    return this.handleMatchCreation(context);
}

// Option 2: Use a debug interface
interface I_DebugMatchComponent {
    triggerMatchCreation(context: I_SceneContext): Promise<void>;
}
```

---

### Performance

#### 6. MEDIUM: No Production Console Log Stripping
**Files**: 63 files with 201 console.log/warn/error calls
**Severity**: MEDIUM

```typescript
// Current (problematic)
console.log(`[PlaygroundScene] Theme changed, updating colors...`);
console.log("[useMatchState] Match state initialized", { player, npc });

// Suggested fix - Use conditional logging
// vite.config.ts
export default defineConfig({
    esbuild: {
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
});

// Or use a logger utility
const log = import.meta.env.DEV ? console.log.bind(console) : () => {};
```

---

## Warnings (Should Fix Soon)

### Security

#### 7. WebSocket URL Hardcoded as Fallback
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/stores/websocket.store.ts:14`

```typescript
// Current
const WS_HOST = import.meta.env.VITE_WS_HOST || "wss://game.rcl-team.com:443";

// Suggested - Fail loudly if not configured
const WS_HOST = import.meta.env.VITE_WS_HOST;
if (!WS_HOST) {
    throw new Error("VITE_WS_HOST environment variable is required");
}
```

---

### Code Practices

#### 8. Unused Parameter Warning
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/game/components/rendering/MeshComponent.ts:109`

```typescript
// Current
update(delta: number): void {
    // delta is never used

// Suggested
update(_delta: number): void {
    // Prefix with underscore to indicate intentionally unused
```

---

#### 9. Magic Numbers Without Constants
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/composables/useCamera.ts:19-24`

```typescript
// Current
const instance = new PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight,
    0.1, // Near
    1000, // Far
);

// Suggested
const CAMERA_DEFAULTS = {
    FOV: 75,
    NEAR_PLANE: 0.1,
    FAR_PLANE: 1000,
} as const;

const instance = new PerspectiveCamera(
    CAMERA_DEFAULTS.FOV,
    window.innerWidth / window.innerHeight,
    CAMERA_DEFAULTS.NEAR_PLANE,
    CAMERA_DEFAULTS.FAR_PLANE,
);
```

---

#### 10. TODO Comments in Production Code
**File**: `/Users/liadgoren/Repositories/RUNE_RPG/web/game/client_rune_dictionary/src/components/match/MatchHUD.vue:69-79`

```typescript
// Multiple TODO comments indicating incomplete implementation
const playerLevel = ref(1); // TODO: Add level to participant interface
const playerMp = ref(10); // TODO: Add MP to participant interface
```

---

## Suggestions (Nice to Have)

### Architecture Improvements

#### 11. Consider Lazy Loading for Heavy Modules
The Rapier WASM module and Three.js could be lazy-loaded to improve initial load time.

#### 12. Add Error Boundaries for Vue Components
Game UI components should have error boundaries to prevent crashes from breaking the entire UI.

#### 13. Implement Feature Flags System
Debug features like `autoMatch` should use a proper feature flag system rather than settings.

---

## File-by-File Summary

| File | Security | Practices | Performance | Notes |
|------|----------|-----------|-------------|-------|
| auth.store.ts | CRITICAL | HIGH | - | Hardcoded credentials, missing $reset |
| Login.vue | CRITICAL | - | - | User passwords in source |
| websocket.store.ts | MEDIUM | - | - | Hardcoded fallback URL |
| PlaygroundScene.ts | - | MEDIUM | - | @ts-ignore usage |
| MeshComponent.ts | - | LOW | - | Unused parameter |
| MatchHUD.vue | - | LOW | - | Multiple TODOs |
| useCamera.ts | - | LOW | - | Magic numbers |
| (63 files) | - | - | MEDIUM | Console logging |

---

## Strengths

1. **Excellent ECS Architecture**: The GameObject/GameComponent pattern with trait-based discovery and priority initialization is well-designed and maintainable.

2. **Memory Management**: CleanupRegistry provides comprehensive resource cleanup, preventing Three.js memory leaks.

3. **Physics Integration**: PhysicsSystem facade properly abstracts Rapier complexity with fixed timestep accumulator pattern.

4. **State Management**: Clean separation between Pinia stores (lifecycle) and composables (granular state).

5. **Documentation**: CLAUDE.md files provide excellent architectural guidance and patterns.

6. **Type Safety**: Good TypeScript usage with proper interfaces and type guards.

---

## Recommendations

### Immediate (Before Any Deployment)
1. **Remove all hardcoded credentials** from source code
2. **Implement secure credential storage** (session storage or encrypted)
3. **Strip console.log in production builds**
4. **Add $reset() to auth.store.ts**

### Short-term (Next Sprint)
5. Replace @ts-ignore with proper debug interfaces
6. Extract magic numbers to named constants
7. Address TODO comments or create tickets
8. Add error boundaries to Vue components

### Long-term (Tech Debt)
9. Implement proper feature flags system
10. Consider lazy loading for Three.js/Rapier
11. Add comprehensive unit tests for game systems
12. Create development vs production configuration profiles

---

*Generated by code-architect subagent*
