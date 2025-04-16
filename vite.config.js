import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 3000,
    allowedHosts: ["ce86-2409-40c2-23-d95d-2db9-dfe-b717-d5d2.ngrok-free.app"],
  },
});
