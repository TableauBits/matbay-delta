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

app.listen(port, listenIp, () => consola.info(`server listening on ${listenIp}:${port}`));
