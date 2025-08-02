import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import { type Request, type Response, Router } from "express";
import { Option } from "oxide.ts";

export const dbURL = Option(process.env["DATABASE_URL"]).expect(
    "environment variable DATABASE_URL not found but is mandatory, check `.env.template`",
);

const sqlite = new Database(dbURL);
const db = drizzle({ client: sqlite, logger: true });
migrate(db, { migrationsFolder: "./drizzle" });

export { db };

async function dump(_: Request, res: Response) {
    res.sendFile(dbURL);
}

const dbApiRouter = Router();
const dbDevRouter = Router();

dbApiRouter.get("/dump", dump);

export { dbApiRouter, dbDevRouter };
