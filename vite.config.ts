import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

import { chromeExtension } from "rollup-plugin-chrome-extension";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";

import manifest from "./src/manifest.json";
import { name, version, description } from "./package.json";

function pathResolve(dir) {
  return resolve(process.cwd(), ".", dir);
}

Object.assign(manifest, { name, version, description });

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: "hd-sfc-chrome-extension",
  },
  resolve: {
    alias: [
      {
        find: /\/@\//,
        replacement: pathResolve("src") + "/",
      },
    ],
  },
  plugins: [
    vue(),
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    chromeExtension({
      manifest,
      contentScripts: {
        preambleCode: false,
      },
    }),
  ],
});
