import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    assetsInclude: ['**/*.wasm'],
    plugins: [
        tailwindcss(),
    ],
})
