// @ts-check

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";

export default tseslint.config(
  [globalIgnores(["dist/*"])],
  js.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["eslint.config.mjs"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // See https://eslint.org/docs/latest/use/configure/rules or https://typescript-eslint.io/rules/.
      // Serverity should be one of the following: 0 = off, 1 = warn, 2 = error.
      eqeqeq: 2,
      "object-shorthand": 1,
      "prefer-template": 1,
      "prefer-arrow-callback": 1,
      "arrow-spacing": 1,
      "arrow-body-style": 1,
      "no-useless-escape": 1,
      "space-before-blocks": 1,
      "no-useless-return": 1,
      "@typescript-eslint/no-misused-promises": 0,
      "@typescript-eslint/no-floating-promises": 1,
      "@typescript-eslint/no-unused-vars": 1,
      "@typescript-eslint/prefer-optional-chain": 1,
    },
  },
  {
    files: ["eslint.config.mjs", "dist/*"],
    extends: [tseslint.configs.disableTypeChecked],
  },
);
