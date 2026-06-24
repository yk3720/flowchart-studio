import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: [
      "lib/**/*.test.ts",
      "backend/**/*.test.ts",
      "frontend/src/lib/**/*.test.ts",
    ],
  },
  resolve: {
    alias: [
      {
        find: "@/components",
        replacement: path.resolve(__dirname, "frontend/src/components"),
      },
      {
        find: "@/samples",
        replacement: path.resolve(__dirname, "frontend/src/samples"),
      },
      {
        find: "@/lib/auth",
        replacement: path.resolve(__dirname, "backend/src/lib/auth"),
      },
      {
        find: "@/lib/supabase",
        replacement: path.resolve(__dirname, "backend/src/lib/supabase"),
      },
      {
        find: "@/lib/flowchart/actions",
        replacement: path.resolve(
          __dirname,
          "backend/src/lib/flowchart/actions"
        ),
      },
      {
        find: "@/client",
        replacement: path.resolve(__dirname, "frontend/src/lib"),
      },
      { find: "@", replacement: path.resolve(__dirname, ".") },
    ],
  },
});
