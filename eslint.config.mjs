import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier/flat";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".claude/**",
      "next-env.d.ts",
      "tsconfig.tsbuildinfo",
      "public/**",
      "scripts/**",
    ],
  },
  {
    // Codebase-wide stylistic preference: the legacy "fetch in useEffect,
    // setState in body" data pattern is used everywhere. React 19's
    // set-state-in-effect rule wants Suspense/actions — out of scope here.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  // Must come last so it can disable conflicting style rules.
  prettierConfig,
];

export default eslintConfig;
