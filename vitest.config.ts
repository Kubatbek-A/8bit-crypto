import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // coverage: {
    //   provider: "v8",
    //   reporter: ["text", "json", "html"],
    //   exclude: [
    //     "node_modules/",
    //     "src/test/",
    //     "**/*.d.ts",
    //     "**/*.config.*",
    //     "dist/",
    //     "coverage/",
    //   ],
    // },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
