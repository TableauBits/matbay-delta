/** biome-ignore-all lint/style/noNonNullAssertion: We really DO want to terminate here if envars are not defined */
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: "./src/**/schema.ts",
    dialect: "sqlite",
    dbCredentials: {
        url: process.env["DATABASE_URL"]!,
    },
    verbose: true,
});
