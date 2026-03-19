// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
// ↓ Implementamos el Server-Side-Rendering (SSR) para poder utilizar variables dinámicas
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
});
