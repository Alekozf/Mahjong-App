// Standalone build: one self-contained HTML file (JS, CSS, fonts and icon inlined) that opens
// by double-clicking, with no server. Browsers block separate module scripts on file:// pages,
// so everything is placed inside the HTML.
// Usage: npm run build:standalone  ->  standalone/mahjong.html
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function inlineEverything() {
  return {
    name: 'inline-everything',
    enforce: 'post',
    transformIndexHtml(html) {
      // the favicon lives in public/, which this build skips: inline it as a data URL
      const svg = fs.readFileSync('public/favicon.svg', 'utf8');
      return html.replace('href="./favicon.svg"', `href="data:image/svg+xml,${encodeURIComponent(svg)}"`);
    },
    generateBundle(_, bundle) {
      const page = bundle['index.html'];
      let html = String(page.source);
      for (const [name, item] of Object.entries(bundle)) {
        if (item.type === 'chunk' && name.endsWith('.js')) {
          const code = item.code.replace(/<\/script/gi, '<\\/script');
          html = html.replace(new RegExp(`<script[^>]*src="[^"]*${escapeRe(name)}"[^>]*></script>`), () => `<script type="module">${code}</script>`);
          delete bundle[name];
        } else if (item.type === 'asset' && name.endsWith('.css')) {
          html = html.replace(new RegExp(`<link[^>]*href="[^"]*${escapeRe(name)}"[^>]*>`), () => `<style>${item.source}</style>`);
          delete bundle[name];
        }
      }
      page.source = html;
      page.fileName = 'mahjong.html';
    },
  };
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [react(), inlineEverything()],
  build: {
    outDir: 'standalone',
    emptyOutDir: true,
    assetsInlineLimit: () => true, // fonts become data URLs inside the CSS
    cssCodeSplit: false,
    modulePreload: false,
  },
});
