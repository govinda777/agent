// .eslintrc.cjs – legacy ESLint config compatible with ESLint 8 and Next.js 14
module.exports = {
  // Use Next.js recommended configs (including core web vitals and TypeScript support)
  extends: [
    "next",
    "next/core-web-vitals",
    "next/typescript"
  ],
  // Custom rule adjustments from the previous flat config
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-require-imports": "off",
    "react-hooks/set-state-in-effect": "off"
  },
  // Ignore generated files and folders
  ignorePatterns: [
    ".next/",
    "out/",
    "build/",
    "node_modules/",
    "scratch/",
    "test-results/",
    "public/test-results/"
  ]
};
