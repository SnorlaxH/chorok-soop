import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react-swc';
import { crx } from "@crxjs/vite-plugin";
import manifest from './manifest.json';
export default defineConfig({
    plugins: [svgr(), react(), crx({ manifest: manifest })],
});
