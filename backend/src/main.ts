import * as dotenv from "dotenv";

dotenv.config();

import consola from "consola";
import cors from "cors";
import express from "express";
import { apiRouter, devRouter } from "./routing";

const isDebug = process.env["ENVIRONMENT"] === "DEBUG";
const port = parseInt(process.env["PORT"] || "3000");
const listenIp = "0.0.0.0";

const app = express().use(cors()).use(express.json());

app.use("/api", apiRouter);
if (isDebug) {
    consola.warn('development mode enabled, testing endpoints are available on "/dev"');
    app.use("/dev", devRouter);
}

// drizzle test
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { migrate } from 'drizzle-orm/bun-sqlite/migrator';

import { eq } from 'drizzle-orm';
import { usersTable } from './db/schema';
import { Database } from 'bun:sqlite';

import { dbURL } from "./db/mod";

const sqlite = new Database(dbURL);
const db = drizzle({ client: sqlite, logger: true});
migrate(db, { migrationsFolder: "./drizzle" });

async function main() {
  const user: typeof usersTable.$inferInsert = {
    discordHandle: 'John',
    // age: 30,
    // email: 'john@example.com',
  };
  await db.insert(usersTable).values(user);
  consola.log('New user created!')
  const users = await db.select().from(usersTable);
  consola.log('Getting all users from the database: ', users)
  await db
    .update(usersTable)
    .set({
      discordHandle: "ahokcool",
    })
    .where(eq(usersTable.discordHandle, user.discordHandle));
  consola.log('User info updated!')
  await db.delete(usersTable).where(eq(usersTable.discordHandle, "ahokcool"));
  consola.log('User deleted!')
}
main();

// end drizzle test

app.listen(port, listenIp, () => consola.info(`server listening on ${listenIp}:${port}`));
