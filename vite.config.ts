import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import topsydeUtilsPlugin from "./plugins/topsyde-utils-vite-plugin";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const WEBSOCKET_HOST = env.VITE_WS_HOST || "wss://topsyde-gaming.duckdns.org:3000";

	console.log("mode", mode);
	console.log("env.VITE_WS_HOST", env.VITE_WS_HOST);
	console.log("env.VITE_HOST", env.VITE_HOST);
	console.log("HTTP/S HOST", env.VITE_HOST);
	console.log("WEBSOCKET_HOST", WEBSOCKET_HOST);

	return {
		plugins: [vue(), tailwindcss(), topsydeUtilsPlugin()],
		base: command === "serve" ? "/" : "/client_rune_dictionary/",
		server: {
			port: 8080,
			proxy: {
				// This is the correct way to define a proxy
				"/ws": {
					target: WEBSOCKET_HOST,
					ws: true,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/ws/, ""),
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
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
	};
});
