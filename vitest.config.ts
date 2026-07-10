import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// Separate from vite.config.ts on purpose: that file is wrapped by
// @lovable.dev/vite-tanstack-config (SSR/nitro/cloudflare build config),
// which Vitest doesn't need and shouldn't have to resolve.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        // Vendored shadcn/ui primitives, not our code.
        "src/components/ui/**",
        // Router-generated file, never hand-written.
        "src/routeTree.gen.ts",
        // Route/page components: JSX-heavy orchestration exercised by
        // manual QA / would-be e2e tests, not unit tests.
        "src/routes/**",
        // Framework bootstrap/wiring with no business logic of our own.
        "src/router.tsx",
        "src/server.ts",
        "src/start.ts",
        // Single createClient() call, nothing to unit test.
        "src/lib/supabase.ts",
        // Two-line wrapper around an external global.
        "src/lib/lovable-error-reporting.ts",
        "src/test/**",
        "**/*.d.ts",
      ],
    },
  },
});
