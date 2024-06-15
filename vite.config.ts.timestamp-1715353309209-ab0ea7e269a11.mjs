// vite.config.ts
import { defineConfig } from "file:///Users/amritjain/Documents/projects/alchemix-multisig-dashboard/alchemix-multisig-enso-frontend/node_modules/vite/dist/node/index.js";
import react from "file:///Users/amritjain/Documents/projects/alchemix-multisig-dashboard/alchemix-multisig-enso-frontend/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { nodePolyfills } from "file:///Users/amritjain/Documents/projects/alchemix-multisig-dashboard/alchemix-multisig-enso-frontend/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "/Users/amritjain/Documents/projects/alchemix-multisig-dashboard/alchemix-multisig-enso-frontend";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        // can also be 'build', 'dev', or false
        global: true,
        process: true
      },
      protocolImports: true
    })
  ],
  define: {
    "process.env": {}
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYW1yaXRqYWluL0RvY3VtZW50cy9wcm9qZWN0cy9hbGNoZW1peC1tdWx0aXNpZy1kYXNoYm9hcmQvYWxjaGVtaXgtbXVsdGlzaWctZW5zby1mcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2Ftcml0amFpbi9Eb2N1bWVudHMvcHJvamVjdHMvYWxjaGVtaXgtbXVsdGlzaWctZGFzaGJvYXJkL2FsY2hlbWl4LW11bHRpc2lnLWVuc28tZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2Ftcml0amFpbi9Eb2N1bWVudHMvcHJvamVjdHMvYWxjaGVtaXgtbXVsdGlzaWctZGFzaGJvYXJkL2FsY2hlbWl4LW11bHRpc2lnLWVuc28tZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IG5vZGVQb2x5ZmlsbHMgfSBmcm9tIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuXG4gICAgbm9kZVBvbHlmaWxscyh7XG4gICAgICBnbG9iYWxzOiB7XG4gICAgICAgIEJ1ZmZlcjogdHJ1ZSwgLy8gY2FuIGFsc28gYmUgJ2J1aWxkJywgJ2RldicsIG9yIGZhbHNlXG4gICAgICAgIGdsb2JhbDogdHJ1ZSxcbiAgICAgICAgcHJvY2VzczogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBwcm90b2NvbEltcG9ydHM6IHRydWUsXG4gICAgfSksXG4gIF0sXG4gIGRlZmluZToge1xuICAgIFwicHJvY2Vzcy5lbnZcIjoge30sXG4gIH0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUErYyxTQUFTLG9CQUFvQjtBQUM1ZSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBSDlCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUVOLGNBQWM7QUFBQSxNQUNaLFNBQVM7QUFBQSxRQUNQLFFBQVE7QUFBQTtBQUFBLFFBQ1IsUUFBUTtBQUFBLFFBQ1IsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLGlCQUFpQjtBQUFBLElBQ25CLENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixlQUFlLENBQUM7QUFBQSxFQUNsQjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3RDO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
