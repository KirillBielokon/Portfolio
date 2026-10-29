import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        portfolio: fileURLToPath(new URL("./index.html", import.meta.url)),
        forma: fileURLToPath(
          new URL("./demo/forma/index.html", import.meta.url),
        ),
      },
    },
  },
});
