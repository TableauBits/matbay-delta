import { Router, type Request, type Response } from "express";
import { checkNil } from "../utils";

export const dbURL = checkNil(
    process.env["DATABASE_URL"],
    "environment variable DATABASE_URL not found but is mandatory, check `.env.template`",
).unwrap();

async function dump(_: Request, res: Response) {
    res.sendFile(dbURL);
}

const dbApiRouter = Router();
const dbDevRouter = Router();

dbApiRouter.get("/dump", dump);

export {dbApiRouter, dbDevRouter}