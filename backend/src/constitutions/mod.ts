import { type Request, type Response, Router } from "express";
import { ensureAuthMiddleware } from "../auth/mod";
import { constitutions, userConstitution } from "./schema";
import { db } from "../db/mod";

import type { CreateConstitutionRequestBody } from "../../../common/constitution";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { Err, Ok, Option, Result } from "oxide.ts";
import { and, eq } from "drizzle-orm";

async function addUserToConstitution(uid: string, cstid: number): Promise<Result<string, Error>> {
  const operation = async () => await db.insert(userConstitution).values({
    user: uid,
    constitution: cstid,
  });

  return (await Result.safe(operation())).map(() => "user successfully joined constitution");
}

async function create(req: Request, res: Response): Promise<void> {
  // TODO : Add validation of the body
  // TODO : Add validation of the permissions of the user (is he allowed to create a constitution ?)

  const uid = Option(req.uid);
  if (uid.isNone()) {
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
  const cstid = Option(queryResult[0]?.id);
  if (cstid.isNone()) {
    sendResult(
      Err(new HttpError(HttpStatus.InternalError, "failed to create constitution. no id returned")),
      res
    );
    return;
  }

  // Add the user as a participant of the constitution
  // TODO : This should be done in a transaction ?
  // TODO : Return the created constitution instead of a simple message ?
  sendResult((await addUserToConstitution(uid.unwrap(), cstid.unwrap()))
  .map(() => "constitution created")
    .mapErr((err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`)), res);
}

async function getAll(_: Request, res: Response): Promise<void> {
  const allConstitutions = await db.query.constitutions.findMany({
    with: {
      userConstitution: {
        columns: {
          user: true,
          joinDate: true
        }
      },
    }
  });

  sendResult(Ok(allConstitutions), res);
}

async function join(req: Request, res: Response): Promise<void> {
  // TODO : Validate the constitution id

  const uid = Option(req.uid);
  if (uid.isNone()) {
    sendResult(
      Err(new HttpError(HttpStatus.InternalError, "missing uid in request, this should never happen")),
      res
    );
    return;
  }

  const id = Option(req.params["id"])
    .okOr(new HttpError(HttpStatus.BadRequest, "missing constitution id from request"));
  if (id.isErr()) {
    sendResult(id, res);
    return;
  }

  const cstid = Result.safe(() => parseInt(id.unwrap()));
  if (cstid.isErr()) {
    sendResult(Err(new HttpError(HttpStatus.BadRequest, `constitution id could not be parse: ${cstid.unwrapErr()}`)), res);
  }

  const result = (await addUserToConstitution(uid.unwrap(), cstid.unwrap()))
    .mapErr((err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`));
  sendResult(result, res);
}

async function leave(req: Request, res: Response): Promise<void> {
  // TODO : Validate the constitution id
  // TODO : Validate that the user is a participant

  if (!req.uid) {
    sendResult(
      Err(new HttpError(HttpStatus.InternalError, "missing uid in request, this should never happen")),
      res
    );
    return;
  }

  const id = Option(req.params["id"])
    .okOr(new HttpError(HttpStatus.BadRequest, "missing constitution id from request"));
  if (id.isErr()) {
    sendResult(id, res);
    return;
  }

  await db.delete(userConstitution).where(
    and(
      eq(userConstitution.user, req.uid),
      eq(userConstitution.constitution, parseInt(id.unwrap()))
    )
  );

  sendResult(Ok("leave constitution"), res);
}

const constitutionApiRouter = Router();
// const constitutionDevRouter = Router();

constitutionApiRouter.use("/create", ensureAuthMiddleware, create);
constitutionApiRouter.use("/getAll", ensureAuthMiddleware, getAll);   // TODO : Use a dev router for testing
constitutionApiRouter.use("/join/:id", ensureAuthMiddleware, join);
constitutionApiRouter.use("/leave/:id", ensureAuthMiddleware, leave);

export { constitutionApiRouter };