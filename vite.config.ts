import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import topsydeUtilsPlugin from "./plugins/topsyde-utils-vite-plugin";
// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), tailwindcss(), topsydeUtilsPlugin()],
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
});
