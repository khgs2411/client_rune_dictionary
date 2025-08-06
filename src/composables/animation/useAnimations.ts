/**
 * Reusable Animation Composables
 * Provides common animation patterns with performance budgets and reduced motion support
 */

import { ref, computed, onMounted, onUnmounted, unref } from 'vue';
import { useAnimationPerformance, type AnimationCategory } from './useAnimationPerformance';

const { 
  prefersReducedMotion, 
  shouldAnimate, 
  createAnimationConfig, 
  getOptimalDuration 
} = useAnimationPerformance();

/**
 * Entrance Animation Composable
 * Provides intersection observer-based entrance animations
 */
export function useEntranceAnimation(
  category: AnimationCategory = 'DECORATIVE',
  options: {
    threshold?: number;
    delay?: number;
    customDuration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'scale';
  } = {}
) {
  const {
    threshold = 0.1,
    delay = 0,
    customDuration,
    direction = 'up'
  } = options;

  const isVisible = ref(false);
  const element = ref<HTMLElement>();
  let observer: IntersectionObserver | null = null;

  // Animation variants based on direction
  const getInitialState = () => {
    if (prefersReducedMotion.value) {
      return { opacity: 0 };
    }

    switch (direction) {
      case 'up':
        return { opacity: 0, y: 40, scale: 0.95 };
      case 'down':
        return { opacity: 0, y: -40, scale: 0.95 };
      case 'left':
        return { opacity: 0, x: 40, scale: 0.95 };
      case 'right':
        return { opacity: 0, x: -40, scale: 0.95 };
      case 'scale':
        return { opacity: 0, scale: 0.8 };
      default:
        return { opacity: 0, y: 40, scale: 0.95 };
    }
  };

  const getAnimateState = () => {
    return { opacity: 1, x: 0, y: 0, scale: 1 };
  };

  const animationConfig = computed(() => {
    const baseConfig = createAnimationConfig(category, customDuration);
    return {
      ...baseConfig,
      delay: delay / 1000, // Convert to seconds
      type: prefersReducedMotion.value ? undefined : 'spring',
      stiffness: prefersReducedMotion.value ? undefined : 100,
      damping: prefersReducedMotion.value ? undefined : 15,
      mass: prefersReducedMotion.value ? undefined : 1,
    };
  });

  onMounted(() => {
    if (!element.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            isVisible.value = true;
            observer?.disconnect();
          }
        });
      },
      { threshold }
    );

    observer.observe(element.value);
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  const getPlainAnimateState = () => {
    const result = isVisible.value ? getAnimateState() : getInitialState();
    return { ...result };
  };

  return {
    element,
    isVisible,
    initial: { ...getInitialState() },
    animate: computed(getPlainAnimateState),
    transition: { ...animationConfig },
  };
}

/**
 * Hover Animation Composable
 * Provides smooth hover state animations
 */
export function useHoverAnimation(
  category: AnimationCategory = 'CRITICAL',
  options: {
    scale?: number;
    translateY?: number;
    rotateY?: number;
    customDuration?: number;
  } = {}
) {
  const {
    scale = 1.05,
    translateY = -2,
    rotateY = 0,
    customDuration
  } = options;

  const isHovered = ref(false);

  const hoverConfig = computed(() => {
    const baseConfig = createAnimationConfig(category, customDuration);
    return {
      ...baseConfig,
      type: prefersReducedMotion.value ? undefined : 'spring',
      stiffness: prefersReducedMotion.value ? undefined : 200,
      damping: prefersReducedMotion.value ? undefined : 20,
    };
  });

  const animateState = computed(() => {
    if (!shouldAnimate.value) {
      return { opacity: 1, scale: 1, y: 0, rotateY: 0 };
    }

    return isHovered.value
      ? { 
          scale,
          y: translateY,
          rotateY,
          opacity: 1,
        }
      : {
          scale: 1,
          y: 0,
          rotateY: 0,
          opacity: 1,
        };
  });

  const handlers = {
    onMouseenter: () => { isHovered.value = true; },
    onMouseleave: () => { isHovered.value = false; },
  };

  return {
    isHovered,
    animate: animateState,
    transition: hoverConfig,
    handlers,
  };
}

/**
 * Stagger Animation Composable
 * Provides sequential animations for lists
 */
export function useStaggerAnimation(
  itemCount: number,
  category: AnimationCategory = 'DECORATIVE',
  options: {
    staggerDelay?: number;
    customDuration?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
  } = {}
) {
  const {
    staggerDelay = 100,
    customDuration,
    direction = 'up'
  } = options;

  const isTriggered = ref(false);

  const getItemInitial = () => {
    if (prefersReducedMotion.value) {
      return { opacity: 0 };
    }

    switch (direction) {
      case 'up':
        return { opacity: 0, y: 20 };
      case 'down':
        return { opacity: 0, y: -20 };
      case 'left':
        return { opacity: 0, x: 20 };
      case 'right':
        return { opacity: 0, x: -20 };
      default:
        return { opacity: 0, y: 20 };
    }
  };

  const getItemAnimate = (index: number) => {
    const delay = isTriggered.value ? (index * staggerDelay) / 1000 : 0;
    const config = createAnimationConfig(category, customDuration);
    
    return {
      state: { opacity: 1, x: 0, y: 0 },
      transition: {
        ...config,
        delay,
        type: prefersReducedMotion.value ? undefined : 'spring',
        stiffness: prefersReducedMotion.value ? undefined : 80,
        damping: prefersReducedMotion.value ? undefined : 12,
      },
    };
  };

  const trigger = () => {
    isTriggered.value = true;
  };

  const reset = () => {
    isTriggered.value = false;
  };

  // Create animation configs for each item
  const items = computed(() => {
    return Array.from({ length: itemCount }, (_, index) => {
      const itemAnimate = getItemAnimate(index);
      return {
        initial: { ...getItemInitial() },
        animate: isTriggered.value ? { ...itemAnimate.state } : { ...getItemInitial() },
        transition: { ...itemAnimate.transition },
      };
    });
  });

  return {
    isTriggered,
    items,
    trigger,
    reset,
  };
}

/**
 * Route Transition Composable
 * Provides page transition animations
 */
export function useRouteTransition(
  category: AnimationCategory = 'TRANSITION',
  options: {
    type?: 'fade' | 'slide' | 'scale';
    customDuration?: number;
  } = {}
) {
  const { type = 'fade', customDuration } = options;

  const config = computed(() => createAnimationConfig(category, customDuration));

  const getTransitionConfig = () => {
    if (prefersReducedMotion.value) {
      return {
        enter: { opacity: 0 },
        enterActive: { opacity: 1 },
        leave: { opacity: 1 },
        leaveActive: { opacity: 0 },
      };
    }

    switch (type) {
      case 'slide':
        return {
          enter: { opacity: 0, x: 100 },
          enterActive: { opacity: 1, x: 0 },
          leave: { opacity: 1, x: 0 },
          leaveActive: { opacity: 0, x: -100 },
        };
      case 'scale':
        return {
          enter: { opacity: 0, scale: 0.9 },
          enterActive: { opacity: 1, scale: 1 },
          leave: { opacity: 1, scale: 1 },
          leaveActive: { opacity: 0, scale: 0.9 },
        };
      case 'fade':
      default:
        return {
          enter: { opacity: 0 },
          enterActive: { opacity: 1 },
          leave: { opacity: 1 },
          leaveActive: { opacity: 0 },
        };
    }
  };

  return {
    transition: config,
    states: getTransitionConfig(),
  };
}

/**
 * Loading Animation Composable
 * Provides loading state animations
 */
export function useLoadingAnimation(
  category: AnimationCategory = 'CRITICAL'
) {
  const isLoading = ref(false);

  const pulseAnimation = computed(() => {
    if (!shouldAnimate.value || !isLoading.value) {
      return { scale: 1, opacity: 1 };
    }

    return {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
    };
  });

  const config = computed(() => ({
    ...createAnimationConfig(category, 1000),
    repeat: Infinity,
    ease: 'easeInOut',
  }));

  const start = () => {
    isLoading.value = true;
  };

  const stop = () => {
    isLoading.value = false;
  };

  return {
    isLoading,
    animate: pulseAnimation,
    transition: config,
    start,
    stop,
  };
}