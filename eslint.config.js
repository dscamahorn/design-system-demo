// ESLint configuration in the "flat config" format that ESLint 9 uses.
// It is a plain list: each entry either turns on a shared rule set or
// applies settings to a group of files. Later entries win over earlier ones.
//
// `npm run app:lint` runs this on the files we own; `npm run app:lint:all`
// runs it on the whole repo (see CLAUDE.md, "Stack and file tiers").
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  // Build output, installed packages, and the Figma Desktop Bridge plugin
  // folder (a gitignored tool download, not project code) are never linted.
  globalIgnores([
    "dist/",
    "storybook-static/",
    "node_modules/",
    ".figma-console-mcp-plugin/",
  ]),

  // Base rule sets: ESLint's own recommended rules, then the TypeScript ones.
  js.configs.recommended,
  tseslint.configs.recommended,

  // Application code runs in the browser, so names like `document` and
  // `window` are known globals rather than undefined variables.
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
  },

  // Config files and the Figma sync scripts run under Node instead.
  {
    files: ["*.{js,ts}", ".storybook/**/*.{ts,tsx}", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },

  // React checks: the rules of hooks, and Vite's fast-refresh requirement
  // that a component file only export components.
  reactHooks.configs["recommended-latest"],
  reactRefresh.configs.vite,

  // Storybook story file conventions.
  storybook.configs["flat/recommended"],
]);
