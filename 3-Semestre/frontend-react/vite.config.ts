import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const signalingUrl =
    env.VITE_SIGNALING_URL ||
    env.SIGNALING_URL ||
    process.env.VITE_SIGNALING_URL ||
    process.env.SIGNALING_URL ||
    '';

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'SIGNALING_'],
    define: signalingUrl
      ? {
          'import.meta.env.VITE_SIGNALING_URL': JSON.stringify(signalingUrl),
          'import.meta.env.SIGNALING_URL': JSON.stringify(signalingUrl),
        }
      : undefined,
    server: {
      proxy: {
        "/api/v1": {
          target: "http://localhost:8082",
          changeOrigin: true,
        },
        "/api": {
          target: "http://localhost:8080",
          changeOrigin: true,
        },
      },
    },
  };
});
