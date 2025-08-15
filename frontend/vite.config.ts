// /frontend/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Importa o plugin do Tailwind

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Adiciona o plugin do Tailwind aqui
  ],
  server: {
    // Necessário para o Docker. O Vite escuta em todas as interfaces de rede.
    host: '0.0.0.0'
  }
})