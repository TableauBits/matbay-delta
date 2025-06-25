import { Router } from "express";
import { token_dev_router } from "./token";

const auth_api_router = Router();
const auth_dev_router = Router();

auth_dev_router.use("/token", token_dev_router);

export { auth_api_router, auth_dev_router };
