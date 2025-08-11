<template>
	<div class="sparkle-demo">
		<h2>Sparkle Effect Showcase</h2>
		<p>Reusable particle effects for your RUNE RPG UI</p>
		
		<div class="demo-grid">
			<!-- Stream Pattern -->
			<div class="demo-card">
				<h3>Stream Pattern</h3>
				<div class="effect-container">
					<SparkleEffect
						:count="10"
						:types="['dot', 'star']"
						:pattern="'stream'"
						:color="'oklch(0.568 0.197 158.76)'"
						:speed="1"
						:size-range="{ min: 2, max: 6 }"
						:glow="true"
						:density="7"
					/>
					<div class="demo-content">Active Timer</div>
				</div>
			</div>
			
			<!-- Burst Pattern -->
			<div class="demo-card">
				<h3>Burst Pattern</h3>
				<div class="effect-container">
					<SparkleEffect
						:count="15"
						:types="['star', 'diamond']"
						:pattern="'burst'"
						:color="'oklch(0.577 0.245 27.325)'"
						:speed="1.5"
						:size-range="{ min: 3, max: 8 }"
						:glow="true"
						:density="8"
						:continuous="true"
					/>
					<div class="demo-content">Critical!</div>
				</div>
			</div>
			
			<!-- Wave Pattern -->
			<div class="demo-card">
				<h3>Wave Pattern</h3>
				<div class="effect-container">
					<SparkleEffect
						:count="12"
						:types="['dot', 'streak']"
						:pattern="'wave'"
						:color="'oklch(0.769 0.188 70.08)'"
						:speed="0.8"
						:size-range="{ min: 2, max: 5 }"
						:glow="true"
						:density="6"
					/>
					<div class="demo-content">Warning</div>
				</div>
			</div>
			
			<!-- Orbit Pattern -->
			<div class="demo-card">
				<h3>Orbit Pattern</h3>
				<div class="effect-container">
					<SparkleEffect
						:count="8"
						:types="['star']"
						:pattern="'orbit'"
						:color="'oklch(0.869 0.158 258.76)'"
						:speed="0.5"
						:size-range="{ min: 3, max: 6 }"
						:glow="true"
						:density="5"
					/>
					<div class="demo-content">Magic</div>
				</div>
			</div>
			
			<!-- Pulse Pattern -->
			<div class="demo-card">
				<h3>Pulse Pattern</h3>
				<div class="effect-container">
					<SparkleEffect
						:count="20"
						:types="['diamond', 'star']"
						:pattern="'pulse'"
						:color="'oklch(0.969 0.188 70.08)'"
						:speed="2"
						:size-range="{ min: 4, max: 10 }"
						:glow="true"
						:density="10"
					/>
					<div class="demo-content">Victory!</div>
				</div>
			</div>
			
			<!-- Random Pattern -->
			<div class="demo-card">
				<h3>Random Pattern</h3>
				<div class="effect-container">
					<SparkleEffect
						:count="15"
						:types="['dot', 'star', 'diamond', 'streak']"
						:pattern="'random'"
						:color="'oklch(0.669 0.197 258.76)'"
						:speed="1.2"
						:size-range="{ min: 2, max: 7 }"
						:glow="true"
						:density="7"
						:continuous="true"
					/>
					<div class="demo-content">Chaos</div>
				</div>
			</div>
		</div>
		
		<!-- Usage Examples -->
		<div class="usage-section">
			<h3>Usage Examples</h3>
			<pre><code>// Basic usage
&lt;SparkleEffect
  :count="10"
  :pattern="'stream'"
  :color="'oklch(0.568 0.197 158.76)'"
/&gt;

// Advanced usage with all props
&lt;SparkleEffect
  :count="15"
  :types="['star', 'diamond', 'streak']"
  :pattern="'burst'"
  :color="colorSystem.getColor('primary')"
  :speed="2"
  :size-range="{ min: 3, max: 8 }"
  :glow="true"
  :density="8"
  :continuous="true"
  :sync-with-timer="true"
/&gt;</code></pre>
		</div>
	</div>
</template>

<script lang="ts" setup>
import SparkleEffect from '../effects/SparkleEffect.vue';
</script>

<style lang="scss" scoped>
.sparkle-demo {
	padding: 2rem;
	max-width: 1200px;
	margin: 0 auto;
	
	h2 {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		color: var(--p-text-color);
	}
	
	> p {
		color: var(--p-text-muted-color);
		margin-bottom: 2rem;
	}
}

.demo-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 2rem;
	margin-bottom: 3rem;
}

.demo-card {
	background: var(--p-content-background);
	border: 1px solid var(--p-content-border-color);
	border-radius: 12px;
	padding: 1.5rem;
	
	h3 {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		color: var(--p-text-color);
	}
}

.effect-container {
	position: relative;
	height: 150px;
	background: linear-gradient(
		135deg,
		var(--p-surface-100),
		var(--p-surface-200)
	);
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.demo-content {
	font-size: 1.5rem;
	font-weight: 600;
	color: var(--p-text-color);
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	z-index: 2;
	position: relative;
}

.usage-section {
	background: var(--p-surface-100);
	border-radius: 12px;
	padding: 2rem;
	
	h3 {
		font-size: 1.5rem;
		margin-bottom: 1rem;
		color: var(--p-text-color);
	}
	
	pre {
		background: var(--p-surface-ground);
		padding: 1.5rem;
		border-radius: 8px;
		overflow-x: auto;
		
		code {
			color: var(--p-primary-color);
			font-family: 'Monaco', 'Courier New', monospace;
			font-size: 0.9rem;
			line-height: 1.5;
		}
	}
}

// Dark mode enhancements
@media (prefers-color-scheme: dark) {
	.effect-container {
		background: linear-gradient(
			135deg,
			rgba(0, 0, 0, 0.3),
			rgba(0, 0, 0, 0.5)
		);
	}
	
	.demo-content {
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
	}
}
</style>