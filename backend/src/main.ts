import * as dotenv from "dotenv";

dotenv.config();

import cors from "@elysiajs/cors";
import swagger from "@elysiajs/swagger";
import consola from "consola";
import Elysia from "elysia";

import { apiRouter, devRouter } from "./routing";

const isDebug = process.env["ENVIRONMENT"] === "DEBUG";
const port = parseInt(process.env["PORT"] || "3000");

const app = new Elysia();
app.use(swagger()).use(cors());

app.use(apiRouter);
if (isDebug) {
    consola.warn('development mode enabled, testing endpoints are available on "/dev"');
    app.use(devRouter);
}

app.listen(port, () => consola.info(`server listening on port ${port}`));
