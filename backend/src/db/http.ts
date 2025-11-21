import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { type Request, type Response, Router } from "express";
import { Option } from "oxide.ts";
import * as schema from "./schemas/index";

export const dbURL = Option(process.env["DATABASE_URL"]).expect(
    "environment variable DATABASE_URL not found but is mandatory, check `.env.template`",
);

const sqlite = new Database(dbURL);
const db = drizzle({
    client: sqlite,
    schema: schema,
    logger: true,
});

// By default, drizzle does not enforce foreign keys so we have to enable it ourselves.
// However, we need to disable it during migrations because they may involve dropping tables.
sqlite.run("PRAGMA foreign_keys = OFF;");
migrate(db, { migrationsFolder: "./drizzle" });
sqlite.run("PRAGMA foreign_keys = ON;");

async function dump(_: Request, res: Response) {
    res.sendFile(dbURL);
}

const dbApiRouter = Router();
const dbDevRouter = Router();

dbApiRouter.get("/dump", dump);

export { db, dbApiRouter, dbDevRouter };
