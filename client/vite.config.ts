import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {alias: {"@" : path.resolve(import.meta.dirname, "./src")}},
  // listen on IPv6 too: Windows tries ::1 first for "localhost", and an IPv4-only server costs ~200ms per connection from WSL
  server: {host: "::"}
})
