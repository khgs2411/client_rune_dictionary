# Combat Interface Overhaul Design Document

## Overview
Complete redesign of the match/combat screen to create an immersive, theme-aware, and responsive combat interface that follows modern RPG UI patterns while maintaining consistency with PrimeVue design system.

## Key Design Principles

1. **Theme Consistency**: All components use PrimeVue CSS variables (`--p-*`)
2. **Responsive First**: Mobile-friendly layouts that adapt seamlessly
3. **Smooth Animations**: CSS transitions and v-motion for fluid interactions
4. **Accessibility**: Proper contrast ratios and keyboard navigation support
5. **Performance**: Optimized animations and efficient re-renders

## Component Architecture

### 1. Chat System Redesign (Subtask 6.6)
- **Type**: Collapsible overlay panel
- **Position**: Slides from right side of screen
- **Features**:
  - Auto-minimize during combat actions
  - Semi-transparent backdrop with blur
  - Smooth slide-in/out animations
  - Mobile: Bottom sheet pattern
- **Theme Variables**:
  - Background: `var(--p-surface-card)`
  - Text: `var(--p-text-color)`
  - Border: `var(--p-surface-border)`

### 2. Battle Arena Background (Subtask 6.7)
- **Replace**: Hardcoded gradient colors
- **New Design**:
  - Theme-aware gradients using `--p-primary-*` variables
  - Subtle particle effects (reduced opacity)
  - Dynamic lighting based on turn state
  - Responsive scaling for different viewports
- **Implementation**:
  ```scss
  background: linear-gradient(
    to bottom,
    var(--p-primary-100),
    var(--p-primary-50),
    var(--p-surface-50)
  );
  ```

### 3. Character Info Cards (Subtask 6.8)
- **Structure**:
  - Contained card design with clear boundaries
  - Character name and level display
  - Integrated HP bar within card
  - PrimeVue icons: `pi-user` (player), `pi-android` (enemy)
- **Theme Variables**:
  - Card background: `var(--p-surface-card)`
  - Border: `var(--p-surface-border)`
  - Shadow: PrimeVue elevation system

### 4. HP Bar System (Subtask 6.9)
- **Visual Design**:
  - Background: `var(--p-surface-200)`
  - Fill colors: Theme-aware gradients
  - Border: `var(--p-surface-border)`
  - Smooth transitions using CSS `transition: width 0.5s ease`
- **States**:
  - Healthy (>50%): `--p-green-*` variants
  - Warning (25-50%): `--p-yellow-*` variants
  - Critical (<25%): `--p-red-*` variants

### 5. Responsive Battle Grid (Subtask 6.10)
- **Desktop Layout** (>768px):
  - Player: Left side
  - Enemy: Right side
  - Central combat area
- **Mobile Layout** (<768px):
  - Player: Bottom-left
  - Enemy: Top-right
  - Compact action panel
- **Implementation**: CSS Grid with media queries

### 6. Action Panel Redesign (Subtask 6.11)
- **Styling**:
  - Background: `var(--p-surface-card)`
  - Border: `1px solid var(--p-surface-border)`
  - Responsive button grid
  - Touch-friendly sizing (min 44px targets)
- **Button States**:
  - Use PrimeVue button severity levels
  - Hover effects with transform
  - Disabled state handling

### 7. Turn Indicator (Subtask 6.12)
- **Design**:
  - Subtle badge at top-center
  - Background: `var(--p-surface-card)`
  - Border: `var(--p-surface-border)`
  - Text: `var(--p-text-color)`
  - Pulse animation during turn changes

### 8. Control Buttons (Subtask 6.13)
- **Updates**:
  - Replace "X" with `pi-sign-out` icon
  - Add settings button with `pi-cog` icon
  - Use PrimeVue secondary button styling
  - Add tooltips for clarity

## Animation Specifications

### Combat Effects
- Damage numbers: Spring animation with v-motion
- Health bar changes: CSS transitions (0.5s ease)
- Turn transitions: Fade + scale animations
- Button interactions: Transform on hover/active

### Chat Overlay
- Slide-in: `transform: translateX(100%)` to `translateX(0)`
- Duration: 300ms with ease-out
- Backdrop fade: 0 to 0.5 opacity

## Mobile Considerations

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Viewport Management**: Proper scaling without horizontal scroll
3. **Performance**: Reduced particle effects on mobile
4. **Layout Adaptation**: Stack elements vertically on small screens

## Implementation Priority

1. Theme-aware backgrounds and colors (foundation)
2. Responsive grid system (structure)
3. Character cards and HP bars (core combat UI)
4. Chat overlay system (communication)
5. Polish: animations, transitions, effects

## Testing Requirements

- Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Mobile devices (iOS Safari, Chrome Android)
- Theme switching (light/dark modes)
- Animation performance under load
- Accessibility compliance (WCAG 2.1 AA)

Batman