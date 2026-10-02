import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/chart.js") || id.includes("node_modules/react-chartjs-2")) {
            return "vendor_charts";
          }
          if (id.includes("node_modules/jspdf") || id.includes("node_modules/html2canvas")) {
            return "vendor_pdf";
          }
          if (id.includes("node_modules/react-bootstrap") || id.includes("node_modules/bootstrap")) {
            return "vendor_ui";
          }
        },
      },
    },
  },
});
