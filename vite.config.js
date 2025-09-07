import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscatorPlugin from 'vite-plugin-javascript-obfuscator';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // obfuscatorPlugin({
    //   rotateStringArray: true,
    // }),
  ],
})
