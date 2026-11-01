import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["dist/", "node_modules/"] },
  js.configs.recommended,
  { files: ["scripts/**", "tests/**", "*.js"], languageOptions: { globals: globals.node } },
  {
    files: ["src/**", "site/**"],
    languageOptions: { globals: { ...globals.browser, ...globals.webextensions } },
  },
];
