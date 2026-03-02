import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(() => ({
  test: {
    globals: true,
    testTimeout: 100000,
    fileParallelism: false,
    env: loadEnv("test", process.cwd(), ""),
  },
}));
