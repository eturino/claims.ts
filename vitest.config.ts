import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      exclude: ["**/__tests__/**", "**/commitlint.config.js"],
    }
  },
});
