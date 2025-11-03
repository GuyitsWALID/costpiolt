import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // Disable no-explicit-any rule globally or set it to warn if preferred
      "@typescript-eslint/no-explicit-any": "off",

      // Ignore unused vars warnings for variables prefixed with _
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],

      // Optionally relax react/no-unescaped-entities or limit its scope
      "react/no-unescaped-entities": "off",

      // react-hooks/exhaustive-deps can be left at default or customized if you want particular behavior
    }
  }
];

export default eslintConfig;
