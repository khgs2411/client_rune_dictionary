import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";
import topsydeUtilsPlugin from "./plugins/topsyde-utils-vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
	return {
		plugins: [vue(), tailwindcss(), wasm(), topsydeUtilsPlugin()],
		base: command === "serve" ? "/" : "/client_rune_dictionary/",
		server: {
			port: 8080,
		},
		build: {
			sourcemap: false,
			minify: true,
			assetsDir: "assets",
			rollupOptions: {
				output: {
					entryFileNames: `assets/[name].[hash].js`,
					chunkFileNames: `assets/[name].[hash].js`,
					assetFileNames: `assets/[name].[hash].[ext]`,
				},
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
			dedupe: ["three"],
		},
		optimizeDeps: {
			exclude: ["three"],
		},
	};
});
