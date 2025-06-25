import { Router } from "express";
import { auth_api_router, auth_dev_router } from "./auth/mod";

const api_router = Router();
const dev_router = Router();

api_router.use("/auth", auth_api_router);
dev_router.use("/auth", auth_dev_router);

export { api_router, dev_router };
