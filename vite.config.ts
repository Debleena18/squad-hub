// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { copyFile } from "node:fs/promises";
import { resolve } from "pathe";

export default defineConfig({
  vite: {
    base: "/squad-hub/",
    build: {
      outDir: "dist"
    },
    environments: {
      client: {
        build: {
          outDir: "dist"
        }
      },
      server: {
        build: {
          outDir: "dist/server"
        }
      }
    },
    plugins: [
      {
        name: "tanstack-server-entry-fix",
        async writeBundle() {
          const from = resolve(process.cwd(), "dist/server/index.js");
          const to = resolve(process.cwd(), "dist/server/server.js");
          try {
            await copyFile(from, to);
          } catch {
            // ignore missing file; build may not have produced it yet
          }
        }
      }
    ]
  },
  tanstackStart: {
    spa: {
      prerender: {
        outputPath: "/index"
      }
    }
  }
});
