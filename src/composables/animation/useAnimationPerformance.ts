/**
 * Animation Performance Management System
 * Provides performance budgets, frame rate monitoring, and reduced motion support
 */

import { Easing } from 'motion-v';
import { computed, getCurrentInstance, onMounted, onUnmounted, ref } from 'vue';

// Performance Budget Configuration
export const ANIMATION_BUDGETS = {
  CRITICAL: 100,    // Critical UI feedback (ms)
  TRANSITION: 300,  // Page/component transitions (ms)
  DECORATIVE: 500,  // Decorative animations (ms)
} as const;

// Animation Categories
export type AnimationCategory = keyof typeof ANIMATION_BUDGETS;

// Performance Metrics Interface
export interface AnimationMetrics {
  duration: number;
  category: AnimationCategory;
  frameRate: number;
  frameDrops: number;
  timestamp: number;
}

// Frame Rate Monitor
class FrameRateMonitor {
  private frames = 0;
  private lastTime = 0;
  private frameRate = ref(60);
  private isMonitoring = false;
  private rafId: number | null = null;

  start() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    this.lastTime = performance.now();
    this.tick();
  }

  stop() {
    this.isMonitoring = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = () => {
    if (!this.isMonitoring) return;

    this.frames++;
    const currentTime = performance.now();
    const elapsed = currentTime - this.lastTime;

    // Calculate FPS every second
    if (elapsed >= 1000) {
      this.frameRate.value = Math.round((this.frames * 1000) / elapsed);
      this.frames = 0;
      this.lastTime = currentTime;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  get fps() {
    return this.frameRate;
  }
}

// Global frame rate monitor instance
const frameMonitor = new FrameRateMonitor();

// Reduced Motion Detection
const prefersReducedMotion = ref(false);
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

// Update reduced motion preference
const updateReducedMotion = () => {
  prefersReducedMotion.value = mediaQuery.matches;
};

// Listen for changes
mediaQuery.addEventListener('change', updateReducedMotion);
updateReducedMotion();

// Performance metrics storage
const performanceMetrics = ref<AnimationMetrics[]>([]);
const maxMetricsStorage = 100; // Keep last 100 metrics

/**
 * Animation Performance Composable
 */
export function useAnimationPerformance() {
  const isMonitoring = ref(false);

  // Only use lifecycle hooks if we're inside a component context
  const instance = getCurrentInstance();
  if (instance) {
    onMounted(() => {
      frameMonitor.start();
      isMonitoring.value = true;
    });

    onUnmounted(() => {
      frameMonitor.stop();
      isMonitoring.value = false;
    });
  } else {
    // Start monitoring immediately if not in component context
    frameMonitor.start();
    isMonitoring.value = true;
  }

  /**
   * Validate animation duration against performance budget
   */
  const validateBudget = (duration: number, category: AnimationCategory): boolean => {
    const budget = ANIMATION_BUDGETS[category];
    const withinBudget = duration <= budget;

    if (!withinBudget) {
      console.warn(
        `Animation budget exceeded: ${duration}ms > ${budget}ms for ${category} animation`
      );
    }

    return withinBudget;
  };

  /**
   * Record animation performance metrics
   */
  const recordMetrics = (duration: number, category: AnimationCategory) => {
    const frameDrops = Math.max(0, 60 - frameMonitor.fps.value);

    const metrics: AnimationMetrics = {
      duration,
      category,
      frameRate: frameMonitor.fps.value,
      frameDrops,
      timestamp: Date.now(),
    };

    performanceMetrics.value.push(metrics);

    // Keep storage size manageable
    if (performanceMetrics.value.length > maxMetricsStorage) {
      performanceMetrics.value.shift();
    }

    // Validate budget
    validateBudget(duration, category);
  };

  /**
   * Get animation duration based on category and reduced motion preference
   */
  const getOptimalDuration = (
    category: AnimationCategory,
    customDuration?: number
  ): number => {
    if (prefersReducedMotion.value) {
      // Use minimal duration for reduced motion
      return Math.min(100, customDuration || ANIMATION_BUDGETS[category]);
    }

    return customDuration || ANIMATION_BUDGETS[category];
  };

  /**
   * Create performance-aware animation config
   */
  const createAnimationConfig = (
    category: AnimationCategory,
    customDuration?: number
  ) => {
    const duration = getOptimalDuration(category, customDuration) / 1000; // Convert to seconds

    return {
      duration,
      ease: <Easing>(prefersReducedMotion.value ? 'linear' : 'easeOut'),
      // Record metrics on animation complete
      onComplete: () => {
        recordMetrics(duration * 1000, category);
      },
    };
  };

  /**
   * Check if animations should be enabled
   */
  const shouldAnimate = computed(() => {
    return !prefersReducedMotion.value && frameMonitor.fps.value > 30;
  });

  /**
   * Get current performance statistics
   */
  const getPerformanceStats = computed(() => {
    const recentMetrics = performanceMetrics.value.slice(-20);

    if (recentMetrics.length === 0) {
      return {
        averageFps: 60,
        averageFrameDrops: 0,
        budgetViolations: 0,
        totalAnimations: 0,
      };
    }

    const averageFps = recentMetrics.reduce((sum, m) => sum + m.frameRate, 0) / recentMetrics.length;
    const averageFrameDrops = recentMetrics.reduce((sum, m) => sum + m.frameDrops, 0) / recentMetrics.length;
    const budgetViolations = recentMetrics.filter(m =>
      m.duration > ANIMATION_BUDGETS[m.category]
    ).length;

    return {
      averageFps: Math.round(averageFps),
      averageFrameDrops: Math.round(averageFrameDrops),
      budgetViolations,
      totalAnimations: performanceMetrics.value.length,
    };
  });

  return {
    // State
    prefersReducedMotion,
    currentFps: frameMonitor.fps,
    shouldAnimate,
    isMonitoring,

    // Methods
    validateBudget,
    recordMetrics,
    getOptimalDuration,
    createAnimationConfig,
    getPerformanceStats,

    // Constants
    BUDGETS: ANIMATION_BUDGETS,
  };
}