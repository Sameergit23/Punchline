import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  // API_URL (from the shell or frontend/.env.local) overrides the Flask address,
  // e.g. when something else already owns port 5000. It is never sent to the browser.
  const env = loadEnv(mode, process.cwd(), "");
  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": env.API_URL || "http://localhost:5000",
      },
    },
  };
});
