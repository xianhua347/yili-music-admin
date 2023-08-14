// eslint-disable-next-line simple-import-sort/imports
import path from 'path';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  esbuild: {
    target: 'ES2020'
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),

    quasar({
      sassVariables: 'src/css/quasar-variables.sass'
    })
  ]
});
