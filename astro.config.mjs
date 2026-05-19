// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";

// https://astro.build/config
// ↓ Implementamos el Server-Side-Rendering (SSR) para poder utilizar variables dinámicas
// ↓ Integramos React para poder usar componentes interactivos como islas (PagosForm)
export default defineConfig({
  output: "server",
  adapter: node({ mode: "standalone" }),
  integrations: [react()],
});
