import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		vue(), 
		tailwindcss()
	],
	server: {
		port: 8080,
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: "modern-compiler",
			},
		},
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
	optimizeDeps: {
		exclude: ['topsyde-utils'],
	},
	build: {
		rollupOptions: {
			external: ['path', 'fs'],
			output: {
				manualChunks: {
					'vendor': [
						'vue',
						'vue-router',
						'pinia',
						'pinia-plugin-persistedstate',
						'@vueuse/core'
					],
					'primevue': [
						'primevue',
						'@primevue/themes'
					],
				},
				chunkFileNames: 'assets/[name]-[hash].js',
				entryFileNames: 'assets/[name]-[hash].js',
				assetFileNames: 'assets/[name]-[hash].[ext]'
			}
		},
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: false,
				drop_debugger: true
			}
		},
		chunkSizeWarningLimit: 600,
		sourcemap: false
	},
});
