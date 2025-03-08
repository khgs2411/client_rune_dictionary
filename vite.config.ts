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
				"/ws": {
					target: WEBSOCKET_HOST,
					ws: true,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/ws/, ""),
					secure: false,
					timeout: 60000,
					configure: (proxy, _options) => {
						proxy.on('error', (err, _req, _res) => {
							console.log('proxy error', err);
						});
						proxy.on('proxyReq', (proxyReq, req, _res) => {
							console.log('Sending Request to the Target:',proxyReq.path, req.method, req.url);
						});
						proxy.on('proxyRes', (proxyRes, req, _res) => {
							console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
						});
					},
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
