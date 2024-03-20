// vite.config.ts
import { defineConfig } from "file:///C:/Users/fryta/Pulpit/desk/Important/Programming%20Projects/Millionaires/client/node_modules/.pnpm/vite@5.0.12/node_modules/vite/dist/node/index.js";
import autoprefixer from "file:///C:/Users/fryta/Pulpit/desk/Important/Programming%20Projects/Millionaires/client/node_modules/.pnpm/autoprefixer@10.4.17(postcss@8.4.33)/node_modules/autoprefixer/lib/autoprefixer.js";
import postcss_nested from "file:///C:/Users/fryta/Pulpit/desk/Important/Programming%20Projects/Millionaires/client/node_modules/.pnpm/postcss-nested@6.0.1(postcss@8.4.33)/node_modules/postcss-nested/index.js";
import tsconfigPaths from "file:///C:/Users/fryta/Pulpit/desk/Important/Programming%20Projects/Millionaires/client/node_modules/.pnpm/vite-tsconfig-paths@4.3.1(typescript@5.3.3)(vite@5.0.12)/node_modules/vite-tsconfig-paths/dist/index.mjs";
import solid from "file:///C:/Users/fryta/Pulpit/desk/Important/Programming%20Projects/Millionaires/client/node_modules/.pnpm/vite-plugin-solid@2.9.1(solid-js@1.8.12)(vite@5.0.12)/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import devtools from "file:///C:/Users/fryta/Pulpit/desk/Important/Programming%20Projects/Millionaires/client/node_modules/.pnpm/solid-devtools@0.29.3(solid-js@1.8.12)(vite@5.0.12)/node_modules/solid-devtools/dist/vite.js";
var vite_config_default = defineConfig({
  plugins: [
    tsconfigPaths(),
    solid(),
    devtools({
      autoname: true
    })
  ],
  css: {
    postcss: {
      plugins: [autoprefixer, postcss_nested]
    }
  },
  server: {
    port: 3e3
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxmcnl0YVxcXFxQdWxwaXRcXFxcZGVza1xcXFxJbXBvcnRhbnRcXFxcUHJvZ3JhbW1pbmcgUHJvamVjdHNcXFxcTWlsbGlvbmFpcmVzXFxcXGNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcZnJ5dGFcXFxcUHVscGl0XFxcXGRlc2tcXFxcSW1wb3J0YW50XFxcXFByb2dyYW1taW5nIFByb2plY3RzXFxcXE1pbGxpb25haXJlc1xcXFxjbGllbnRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL2ZyeXRhL1B1bHBpdC9kZXNrL0ltcG9ydGFudC9Qcm9ncmFtbWluZyUyMFByb2plY3RzL01pbGxpb25haXJlcy9jbGllbnQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcclxuaW1wb3J0IGF1dG9wcmVmaXhlciBmcm9tICdhdXRvcHJlZml4ZXInO1xyXG5pbXBvcnQgcG9zdGNzc19uZXN0ZWQgZnJvbSAncG9zdGNzcy1uZXN0ZWQnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuaW1wb3J0IHNvbGlkIGZyb20gJ3ZpdGUtcGx1Z2luLXNvbGlkJztcclxuaW1wb3J0IGRldnRvb2xzIGZyb20gJ3NvbGlkLWRldnRvb2xzL3ZpdGUnO1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG5cdHBsdWdpbnM6IFtcclxuXHRcdHRzY29uZmlnUGF0aHMoKSxcclxuXHRcdHNvbGlkKCksXHJcblx0XHRkZXZ0b29scyh7XHJcblx0XHRcdGF1dG9uYW1lOiB0cnVlLFxyXG5cdFx0fSksXHJcblx0XSxcclxuXHRjc3M6IHtcclxuXHRcdHBvc3Rjc3M6IHtcclxuXHRcdFx0cGx1Z2luczogW2F1dG9wcmVmaXhlciwgcG9zdGNzc19uZXN0ZWRdLFxyXG5cdFx0fSxcclxuXHR9LFxyXG5cdHNlcnZlcjoge1xyXG5cdFx0cG9ydDogMzAwMCxcclxuXHR9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2YSxTQUFTLG9CQUFvQjtBQUMxYyxPQUFPLGtCQUFrQjtBQUN6QixPQUFPLG9CQUFvQjtBQUMzQixPQUFPLG1CQUFtQjtBQUMxQixPQUFPLFdBQVc7QUFDbEIsT0FBTyxjQUFjO0FBQ3JCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzNCLFNBQVM7QUFBQSxJQUNSLGNBQWM7QUFBQSxJQUNkLE1BQU07QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNSLFVBQVU7QUFBQSxJQUNYLENBQUM7QUFBQSxFQUNGO0FBQUEsRUFDQSxLQUFLO0FBQUEsSUFDSixTQUFTO0FBQUEsTUFDUixTQUFTLENBQUMsY0FBYyxjQUFjO0FBQUEsSUFDdkM7QUFBQSxFQUNEO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDUCxNQUFNO0FBQUEsRUFDUDtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
