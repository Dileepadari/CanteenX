import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Types are generated from the running API's schema, never hand-maintained.
 *
 * The previous build kept `src/types/models.ts` with a header instructing the
 * reader to "keep this in sync with backend/app/models/*.py" - it was imported
 * by exactly one file, and every GraphQL result elsewhere was implicitly `any`.
 *
 * Start the backend, then: npm run codegen
 */
const config: CodegenConfig = {
  schema: process.env.VITE_CODEGEN_SCHEMA ?? "http://127.0.0.1:8000/api/graphql",
  documents: ["src/**/*.{ts,tsx}", "!src/graphql/generated/**/*"],
  ignoreNoDocuments: true,
  generates: {
    "src/graphql/generated/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        useTypeImports: true,
        enumsAsTypes: false,
        scalars: {
          DateTime: "string",
          Date: "string",
          Time: "string",
          JSON: "Record<string, unknown>",
        },
      },
    },
  },
};

export default config;
