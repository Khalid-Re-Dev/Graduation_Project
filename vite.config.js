import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  preview: {
    allowedHosts: ["binc.onrender.com"]
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  }
})

