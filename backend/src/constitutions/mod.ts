import {type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/mod";
import { constitutions, userConstitutionParticipation } from "./schema";
import { db } from "../db/mod";

import type { CreateConstitutionRequestBody } from "../../../common/constitution";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { Err, Ok } from "oxide.ts";

// type Constitution = typeof constitutions.$inferInsert;

async function create(req: Request, res: Response): Promise<void> {

  // TODO : Add validation of the body
  // TODO : Add validation of the permissions of the user (is he allowed to create a constitution ?)

  if (!req.uid) {
    sendResult(
      Err(new HttpError(HttpStatus.InternalError, "missing uid in request, this should never happen")),
      res
    );
    return;
  }

  const body = req.body as CreateConstitutionRequestBody;

  // Create the constitution
  const queryResult = await db.insert(constitutions).values({
    name: body.name,
    description: body.description,
    owner: req.uid
  }).returning();

  // Get the id of the created constitution
  const constitutionId = queryResult[0]?.id;

  if (!constitutionId) {
    sendResult(
      Err(new HttpError(HttpStatus.InternalError, "failed to create constitution. no id returned")),
      res
    );
    return;
  }

  // Add the user as a participant of the constitution
  // TODO : This should be done in a transaction ?
  await db.insert(userConstitutionParticipation).values({
    user: req.uid,
    constitution: constitutionId,
  });

  // TODO : Return the created constitution instead of a simple message ?
  sendResult(Ok("constitution created"), res);
}

const constitutionApiRouter = Router();

constitutionApiRouter.use("/create", ensureAuthMiddleware, create);

export { constitutionApiRouter };