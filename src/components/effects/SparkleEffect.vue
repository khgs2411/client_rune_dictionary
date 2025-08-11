<template>
	<div class="sparkle-effect-container" :class="containerClass">
		<div 
			v-for="particle in particles" 
			:key="particle.id"
			class="sparkle-particle"
			:class="[
				`sparkle-${particle.type}`,
				`sparkle-size-${particle.size}`,
				{ 'sparkle-glow': glow }
			]"
			:style="{
				'--delay': `${particle.delay}s`,
				'--duration': `${particle.duration}s`,
				'--start-x': `${particle.startX}%`,
				'--start-y': `${particle.startY}%`,
				'--end-x': `${particle.endX}%`,
				'--end-y': `${particle.endY}%`,
				'--color': particle.color || sparkleColor,
				'--size': `${particle.scale}px`,
				'--glow-size': `${particle.scale * 2}px`,
				animationDelay: `${particle.delay}s`,
				animationDuration: `${particle.duration}s`
			}"
		>
			<div class="sparkle-core"></div>
			<div v-if="particle.type === 'star'" class="sparkle-star">
				<svg viewBox="0 0 24 24" :width="particle.scale" :height="particle.scale">
					<path d="M12 2L14.09 8.26L20.78 9.27L16.39 13.36L17.61 20L12 16.67L6.39 20L7.61 13.36L3.22 9.27L9.91 8.26L12 2Z" fill="currentColor"/>
				</svg>
			</div>
			<div v-else-if="particle.type === 'diamond'" class="sparkle-diamond">
				<svg viewBox="0 0 24 24" :width="particle.scale" :height="particle.scale">
					<path d="M12 2L22 12L12 22L2 12Z" fill="currentColor"/>
				</svg>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';

interface SparkleParticle {
	id: number;
	type: 'dot' | 'star' | 'diamond' | 'streak';
	size: 'xs' | 'sm' | 'md' | 'lg';
	scale: number;
	delay: number;
	duration: number;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
	color?: string;
}

interface Props {
	/** Number of sparkle particles */
	count?: number;
	/** Particle types to use */
	types?: Array<'dot' | 'star' | 'diamond' | 'streak'>;
	/** Animation pattern */
	pattern?: 'random' | 'wave' | 'burst' | 'stream' | 'orbit' | 'pulse';
	/** Base color for sparkles (CSS color value) */
	color?: string;
	/** Speed multiplier (1 = normal, 2 = twice as fast) */
	speed?: number;
	/** Size range for particles */
	sizeRange?: { min: number; max: number };
	/** Enable glow effect */
	glow?: boolean;
	/** Density of particles (1-10) */
	density?: number;
	/** Container class for styling */
	containerClass?: string;
	/** Continuous generation of new particles */
	continuous?: boolean;
	/** Use 333ms intervals for animations (for timer sync) */
	syncWithTimer?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	count: 12,
	types: () => ['dot', 'star'],
	pattern: 'stream',
	color: 'oklch(0.769 0.188 70.08)',
	speed: 1,
	sizeRange: () => ({ min: 2, max: 6 }),
	glow: true,
	density: 5,
	continuous: false,
	syncWithTimer: false
});

const particles = ref<SparkleParticle[]>([]);
const particleIdCounter = ref(0);
const animationFrame = ref<number>();

// Computed base duration for timer sync
const baseDuration = computed(() => {
	if (props.syncWithTimer) {
		// Use multiples of 333ms for timer sync
		return 2.664 / props.speed; // 8x 333ms
	}
	return 3 / props.speed;
});

// Sparkle color with opacity
const sparkleColor = computed(() => {
	return props.color || 'oklch(0.769 0.188 70.08)';
});

// Generate particle based on pattern
function generateParticle(): SparkleParticle {
	const id = particleIdCounter.value++;
	const types = props.types;
	const type = types[Math.floor(Math.random() * types.length)];
	const sizes: Array<'xs' | 'sm' | 'md' | 'lg'> = ['xs', 'sm', 'md', 'lg'];
	const size = sizes[Math.floor(Math.random() * sizes.length)];
	
	// Scale based on size
	const sizeScales = { xs: 0.5, sm: 0.75, md: 1, lg: 1.5 };
	const baseScale = props.sizeRange.min + Math.random() * (props.sizeRange.max - props.sizeRange.min);
	const scale = baseScale * sizeScales[size];
	
	// Duration with variance
	const duration = baseDuration.value * (0.7 + Math.random() * 0.6);
	
	// Delay for staggered effect
	const delay = props.continuous ? Math.random() * baseDuration.value : Math.random() * 0.5;
	
	// Position and movement based on pattern
	let startX = 0, startY = 0, endX = 100, endY = 0;
	
	switch (props.pattern) {
		case 'random':
			startX = Math.random() * 100;
			startY = Math.random() * 100;
			endX = Math.random() * 100;
			endY = Math.random() * 100;
			break;
			
		case 'wave':
			startX = -5;
			startY = 20 + Math.random() * 60;
			endX = 105;
			endY = startY + (Math.random() - 0.5) * 20;
			break;
			
		case 'burst':
			startX = 50;
			startY = 50;
			const angle = Math.random() * Math.PI * 2;
			const distance = 40 + Math.random() * 30;
			endX = 50 + Math.cos(angle) * distance;
			endY = 50 + Math.sin(angle) * distance;
			break;
			
		case 'stream':
			startX = -5;
			startY = 30 + Math.random() * 40;
			endX = 105;
			endY = startY + (Math.random() - 0.5) * 10;
			break;
			
		case 'orbit':
			const orbitAngle = (id * Math.PI * 2) / props.count;
			startX = 50 + Math.cos(orbitAngle) * 40;
			startY = 50 + Math.sin(orbitAngle) * 40;
			endX = 50 + Math.cos(orbitAngle + Math.PI) * 40;
			endY = 50 + Math.sin(orbitAngle + Math.PI) * 40;
			break;
			
		case 'pulse':
			const pulseAngle = Math.random() * Math.PI * 2;
			startX = 50 + Math.cos(pulseAngle) * 10;
			startY = 50 + Math.sin(pulseAngle) * 10;
			endX = 50 + Math.cos(pulseAngle) * 50;
			endY = 50 + Math.sin(pulseAngle) * 50;
			break;
	}
	
	// Add color variations for some particles
	let color;
	if (Math.random() > 0.7) {
		// Occasionally use a complementary color
		color = 'oklch(0.869 0.158 258.76)'; // Purple tint
	} else if (Math.random() > 0.8) {
		color = 'oklch(0.969 0.108 158.76)'; // Light green tint
	}
	
	return {
		id,
		type,
		size,
		scale,
		delay,
		duration,
		startX,
		startY,
		endX,
		endY,
		color
	};
}

// Initialize particles
function initParticles() {
	const particleCount = Math.floor(props.count * (props.density / 5));
	particles.value = Array.from({ length: particleCount }, () => generateParticle());
}

// Continuous particle generation
function continuousGeneration() {
	if (!props.continuous) return;
	
	const generate = () => {
		// Remove old particles
		const now = Date.now();
		particles.value = particles.value.filter(p => {
			// Keep particles that are still animating
			return true; // For simplicity, let CSS handle removal
		});
		
		// Add new particles gradually
		if (particles.value.length < props.count * (props.density / 5)) {
			particles.value.push(generateParticle());
		}
		
		animationFrame.value = requestAnimationFrame(generate);
	};
	
	animationFrame.value = requestAnimationFrame(generate);
}

onMounted(() => {
	initParticles();
	if (props.continuous) {
		continuousGeneration();
	}
});

onUnmounted(() => {
	if (animationFrame.value) {
		cancelAnimationFrame(animationFrame.value);
	}
});
</script>

<style lang="scss" scoped>
.sparkle-effect-container {
	position: absolute;
	inset: 0;
	pointer-events: none;
	overflow: hidden;
	z-index: 1;
}

.sparkle-particle {
	position: absolute;
	pointer-events: none;
	will-change: transform, opacity;
	animation: sparkle-motion var(--duration) ease-out infinite;
	animation-delay: var(--delay);
	
	// Base particle styles
	.sparkle-core {
		width: var(--size);
		height: var(--size);
		background: radial-gradient(circle, var(--color), transparent 70%);
		border-radius: 50%;
		filter: brightness(1.5);
	}
	
	// Glow effect
	&.sparkle-glow .sparkle-core {
		box-shadow: 
			0 0 var(--size) var(--color),
			0 0 var(--glow-size) oklch(from var(--color) l c h / 0.5);
	}
	
	// Star shape
	.sparkle-star {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: var(--color);
		filter: drop-shadow(0 0 2px var(--color));
		animation: sparkle-rotate 3s linear infinite;
	}
	
	// Diamond shape
	.sparkle-diamond {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(45deg);
		color: var(--color);
		filter: drop-shadow(0 0 2px var(--color));
		animation: sparkle-rotate 4s linear infinite reverse;
	}
	
	// Streak type (elongated particle)
	&.sparkle-streak .sparkle-core {
		width: calc(var(--size) * 3);
		height: calc(var(--size) * 0.5);
		border-radius: 50%;
		background: linear-gradient(90deg, transparent, var(--color), transparent);
	}
	
	// Size variations
	&.sparkle-size-xs {
		opacity: 0.7;
	}
	
	&.sparkle-size-sm {
		opacity: 0.85;
	}
	
	&.sparkle-size-md {
		opacity: 1;
	}
	
	&.sparkle-size-lg {
		opacity: 1;
		filter: brightness(1.2);
	}
}

// Main animation for particle movement
@keyframes sparkle-motion {
	0% {
		left: var(--start-x);
		top: var(--start-y);
		opacity: 0;
		transform: scale(0) translateZ(0);
	}
	
	10% {
		opacity: 1;
		transform: scale(1) translateZ(0);
	}
	
	90% {
		opacity: 1;
		transform: scale(1) translateZ(0);
	}
	
	100% {
		left: var(--end-x);
		top: var(--end-y);
		opacity: 0;
		transform: scale(0) translateZ(0);
	}
}

// Rotation animation for stars and diamonds
@keyframes sparkle-rotate {
	from {
		transform: translate(-50%, -50%) rotate(0deg);
	}
	to {
		transform: translate(-50%, -50%) rotate(360deg);
	}
}

// Pulse pattern animation
@keyframes sparkle-pulse {
	0%, 100% {
		transform: scale(0.8);
		opacity: 0.5;
	}
	50% {
		transform: scale(1.2);
		opacity: 1;
	}
}

// Different patterns can have different container behaviors
.sparkle-effect-container {
	&.sparkle-pattern-burst {
		animation: container-pulse 3s ease-in-out infinite;
	}
	
	&.sparkle-pattern-pulse {
		animation: container-breathe 4s ease-in-out infinite;
	}
}

@keyframes container-pulse {
	0%, 100% {
		transform: scale(1);
	}
	50% {
		transform: scale(1.05);
	}
}

@keyframes container-breathe {
	0%, 100% {
		opacity: 0.8;
	}
	50% {
		opacity: 1;
	}
}

// Performance optimizations
@media (prefers-reduced-motion: reduce) {
	.sparkle-particle {
		animation: none !important;
	}
	
	.sparkle-star,
	.sparkle-diamond {
		animation: none !important;
	}
}
</style>