import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Clean local Vite config for the ActiList roundtrip demo.
// Server options are gated on FIGMA so the project runs identically in local
// dev but binds to Figma's supplied PORT/host when imported as a Code Layer.
// https://vite.dev/config/
const inFigma = Boolean(process.env.FIGMA)

export default defineConfig({
  // `base` resolves in priority order:
  //   1. FIGMA_PUBLIC_URL  – when served as a Figma Code Layer
  //   2. BASE_PATH         – set by the GitHub Pages deploy workflow (e.g. /actilistroundtripdemo/)
  //   3. '/'               – local dev default
  base: process.env.FIGMA_PUBLIC_URL
    ? `${process.env.FIGMA_PUBLIC_URL}/`
    : process.env.BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
  server: {
    port: inFigma ? Number(process.env.PORT) : 5173,
    host: inFigma ? process.env.FIGMA_DEV_SERVER_HOST || '0.0.0.0' : undefined,
    strictPort: inFigma,
    open: !inFigma,
  },
})
