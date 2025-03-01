<template>
	<div 
		v-if="loading" 
		class="loading fixed inset-0 flex flex-col items-center justify-center z-[9999] bg-black bg-opacity-80 backdrop-blur-sm transition-all duration-300"
	>
		<div class="spinner-container mb-4">
			<div class="spinner border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
		</div>
		<h2 class="text-primary text-xl font-semibold">{{ message || 'Loading...' }}</h2>
		<p v-if="subMessage" class="text-surface-200 mt-2">{{ subMessage }}</p>
	</div>
</template>

<script lang="ts" setup>

 defineProps({
	loading: { 
		type: Boolean, 
		required: true 
	},
	message: {
		type: String,
		default: 'Loading...'
	},
	subMessage: {
		type: String,
		default: ''
	}
});
</script>

<style lang="scss" scoped>
.loading {
	animation: fadeIn 0.3s ease-in-out;
	z-index: 9999; /* Extremely high z-index to ensure it's above everything */
}

.spinner-container {
	position: relative;
	width: 60px;
	height: 60px;
}

.spinner {
	position: absolute;
	width: 100%;
	height: 100%;
	border-width: 4px;
	border-style: solid;
	border-radius: 50%;
	animation: spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}

@keyframes spin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
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
</style>
