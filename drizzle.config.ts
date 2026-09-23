import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url:
      (globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> };
      }).process?.env?.DATABASE_URL ?? "",
  },
});
