import * as dotenv from "dotenv";

dotenv.config();

import http from "node:http";
import consola from "consola";
import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { apiRouter, devRouter } from "./http-routing";
import { attachWSListeners } from "./ws-routing";

const isDebug = process.env["ENVIRONMENT"] === "DEBUG";
const port = parseInt(process.env["PORT"] || "3000");
const listenIp = "0.0.0.0";

const app = express().use(cors()).use(express.json());
app.use("/api", apiRouter);
if (isDebug) {
    consola.warn('development mode enabled, testing endpoints are available on "/dev"');
    app.use("/dev", devRouter);
}

const httpServer = http.createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });
io.on("connect", (socket) => {
    attachWSListeners(socket);
    consola.info("new socket registered");
});

httpServer.listen(port, listenIp, () => consola.info(`server listening on ${listenIp}:${port}`));
