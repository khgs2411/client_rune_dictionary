import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import topsydeUtilsPlugin from "./plugins/topsyde-utils-vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const WEBSOCKET_HOST = env.VITE_WS_HOST || "wss://topsyde-gaming.duckdns.org:3000";

	return {
		plugins: [vue(), tailwindcss(), topsydeUtilsPlugin()],
		base: command === "serve" ? "/" : "/client_rune_dictionary/",
		server: {
			port: 8080,
			proxy: {
				"/ws": {
					target: WEBSOCKET_HOST,
					ws: true,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/ws/, ""),
					secure: true,
					timeout: 60000,
				},
			},
		},
		css: {
			preprocessorOptions: {
				scss: {
					api: "modern-compiler",
				},
			},
		},
		build: {
			sourcemap: false,
			minify: true,
			assetsDir: "chunks",
			rollupOptions: {
				output: {
					entryFileNames: `chunks/[name].[hash].js`,
					chunkFileNames: `chunks/[name].[hash].js`,
					assetFileNames: `assets/[name].[hash].[ext]`,
				},
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};
});
