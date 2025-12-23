import { Database } from "bun:sqlite";
import consola from "consola";
import { type Logger, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { type Request, type Response, Router } from "express";
import { Option } from "oxide.ts";
import * as schema from "./schemas/index";

export const dbURL = Option(process.env["DATABASE_URL"]).expect(
    "environment variable DATABASE_URL not found but is mandatory, check `.env.template`",
);

class DBLogger implements Logger {
    logQuery(query: string, params: unknown[]): void {
        consola.debug({ query, params });
    }
}

const sqlite = new Database(dbURL);
const db = drizzle({
    client: sqlite,
    schema: schema,
    logger: new DBLogger(),
});

// By default, drizzle does not enforce foreign keys so we have to enable it ourselves.
// However, we need to disable it during migrations because they may involve dropping tables.
db.run(sql`PRAGMA foreign_keys = OFF;`);
migrate(db, { migrationsFolder: "./drizzle" });
db.run(sql`PRAGMA foreign_keys = ON;`);

async function dump(_: Request, res: Response) {
    res.sendFile(dbURL);
}

const dbApiRouter = Router();
const dbDevRouter = Router();

dbApiRouter.get("/dump", dump);

export { db, dbApiRouter, dbDevRouter };
