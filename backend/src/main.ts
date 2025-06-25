/** biome-ignore-all lint/complexity/useLiteralKeys: we don't control the `env` object so using indexing makes sense here */
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { api_router, dev_router } from "./routing";
import consola from "consola";

const is_prod = process.env["ENVIRONMENT"] === "PRODUCTION";
const port = parseInt(process.env["PORT"] || "3000");
const listen_ip = is_prod ? "0.0.0.0" : "127.0.0.1";

const app = express().use(cors()).use(express.json());

app.use("/api", api_router);
if (!is_prod) {
    consola.warn('development mode enabled, testing endpoints are available on "/dev"');
    app.use("/dev", dev_router);
}

app.listen(port, listen_ip, () => consola.info(`server listening on ${listen_ip}:${port}`));
