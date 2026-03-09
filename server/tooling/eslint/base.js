/// <reference types="./types.d.ts" />

import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";

/**
 * All packages that leverage t3-env should use this rule
 */
export const restrictEnvAccess = defineConfig([
  { ignores: ["**/env.ts"] },
  eslintConfigPrettier,
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],

    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          name: "process",
          importNames: ["env"],
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
    },
  },
]);

export default defineConfig([
  { ignores: ["**/*.config.*", "**/sst-env.d.ts"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      "unused-imports": unusedImports,
      unicorn: eslintPluginUnicorn,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/no-namespace": "off",

      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
        },
      ],

      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": ["off"],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: true,
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  },
]);
