import * as dotenv from "dotenv";

dotenv.config();

import consola from "consola";
import cors from "cors";
import express from "express";
import { api_router, dev_router } from "./routing";

const is_debug = process.env["ENVIRONMENT"] === "DEBUG";
const port = parseInt(process.env["PORT"] || "3000");
const listen_ip = "0.0.0.0";

const app = express().use(cors()).use(express.json());

app.use("/api", api_router);
if (is_debug) {
    consola.warn('development mode enabled, testing endpoints are available on "/dev"');
    app.use("/dev", dev_router);
}

app.listen(port, listen_ip, () => consola.info(`server listening on ${listen_ip}:${port}`));
