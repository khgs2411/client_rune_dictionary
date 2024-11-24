import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue()],
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
