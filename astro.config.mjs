import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://phenix.demo',
  build: { inlineStylesheets: 'auto' },
});
