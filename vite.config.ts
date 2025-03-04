import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import topsydeUtilsPlugin from "./plugins/topsyde-utils-vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
	
	return {
		plugins: [vue(), tailwindcss(), topsydeUtilsPlugin()],
		server: {
			port: 8080,
			...(command === "serve" && {
				fs: {
					// Allow serving files from one level up from the package root
					allow: [".."],
				},
			}),
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
		build: {
			rollupOptions: {
				// Don't externalize in development or production
				external: [],
				output: {
					manualChunks: {
						vendor: ["vue", "vue-router", "pinia", "pinia-plugin-persistedstate", "@vueuse/core"],
						primevue: ["primevue", "@primevue/themes"],
					},
					chunkFileNames: "assets/[name]-[hash].js",
					entryFileNames: "assets/[name]-[hash].js",
					assetFileNames: "assets/[name]-[hash].[ext]",
				},
			},
			minify: "terser",
			terserOptions: {
				compress: {
					drop_console: false,
					drop_debugger: true,
				},
			},
			chunkSizeWarningLimit: 600,
			sourcemap: false,
		},
	};
});
