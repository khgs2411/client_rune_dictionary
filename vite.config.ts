import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import topsydeUtilsPlugin from "./plugins/topsyde-utils-vite-plugin";
// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
	const isProduction = mode === 'production';
	return {
		plugins: [vue(), tailwindcss(), topsydeUtilsPlugin()],
		base: command === "serve" ? "/" : "/client_rune_dictionary/",
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
		define: {
			"process.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
			"import.meta.env.NODE_ENV": JSON.stringify(isProduction ? "production" : "development"),
			"import.meta.env.VITE_WS_HOST": JSON.stringify(isProduction ? "129.159.159.241" : "localhost"),
		},
	};
});
