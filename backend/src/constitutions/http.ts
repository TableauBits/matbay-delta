import { and, eq } from "drizzle-orm";
import { type Request, type Response, Router } from "express";
import { Err, Ok, Option, Result } from "oxide.ts";
import type { CreateConstitutionRequestBody } from "../../../common/constitution";
import { ensureAuthMiddleware } from "../auth/http";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { HttpError, HttpStatus, sendResult } from "../utils";
import { constitutions, userConstitution } from "./schema";
import { onUserJoinCallback, onUserLeaveCallback } from "./ws";

// Utils functions
async function addUserToConstitution(uid: string, cstid: number): Promise<Result<DB.UserConstitution, Error>> {
    const operation = async () =>
        await db
            .insert(userConstitution)
            .values({
                user: uid,
                constitution: cstid,
            })
            .returning();

    const insertResult = (await Result.safe(operation())).map((vals) => vals[0] as DB.UserConstitution);
    if (insertResult.isOk()) {
        onUserJoinCallback(insertResult.unwrap());
    }

    return insertResult;
}

async function removeUserFromConstitution(uid: string, cstid: number): Promise<Result<DB.UserConstitution, Error>> {
    const operation = async () =>
        await db
            .delete(userConstitution)
            .where(and(eq(userConstitution.user, uid), eq(userConstitution.constitution, cstid)))
            .returning();

    const removeResult = (await Result.safe(operation())).map((vals) => Option(vals[0]));
    if (removeResult.isErr()) return removeResult;

    const removeRow = removeResult.unwrap().okOr(new Error("nothing to remove"));
    if (removeRow.isOk()) {
        onUserLeaveCallback(removeRow.unwrap());
    }

    return removeRow;
}

// Endpoint functions
async function create(req: Request, res: Response): Promise<void> {
    // TODO : Add validation of the body
    // TODO : Add validation of the permissions of the user (is he allowed to create a constitution ?)

    const uid = Option(req.uid);
    if (uid.isNone()) {
        sendResult(
            Err(new HttpError(HttpStatus.InternalError, "missing uid in request, this should never happen")),
            res,
        );
        return;
    }

    const body = req.body as CreateConstitutionRequestBody;

    // Create the constitution
    const queryResult = await db
        .insert(constitutions)
        .values({
            name: body.name,
            description: body.description,
            owner: req.uid,
        })
        .returning();

    // Get the id of the created constitution
    const cstid = Option(queryResult[0]?.id);
    if (cstid.isNone()) {
        sendResult(Err(new HttpError(HttpStatus.InternalError, "failed to create constitution. no id returned")), res);
        return;
    }

    // Add the user as a participant of the constitution
    // TODO : This should be done in a transaction ?
    // TODO : Return the created constitution instead of a simple message ?
    sendResult(
        (await addUserToConstitution(uid.unwrap(), cstid.unwrap()))
            .map(() => "constitution created")
            .mapErr((err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`)),
        res,
    );
}

async function getAll(_: Request, res: Response): Promise<void> {
    // Get all constitutions with the list of participants
    const allConstitutions = await db.query.constitutions.findMany({
        with: {
            userConstitution: {
                columns: {
                    user: true,
                    joinDate: true,
                },
            },
        },
    });

    sendResult(Ok(allConstitutions), res);
}

async function join(req: Request, res: Response): Promise<void> {
    const uid = Option(req.uid);
    if (uid.isNone()) {
        sendResult(
            Err(new HttpError(HttpStatus.InternalError, "missing uid in request, this should never happen")),
            res,
        );
        return;
    }

    const id = Option(req.params["id"]).okOr(
        new HttpError(HttpStatus.BadRequest, "missing constitution id from request"),
    );
    if (id.isErr()) {
        sendResult(id, res);
        return;
    }

    const cstid = Result.safe(() => parseInt(id.unwrap()));
    if (cstid.isErr()) {
        sendResult(
            Err(new HttpError(HttpStatus.BadRequest, `constitution id could not be parse: ${cstid.unwrapErr()}`)),
            res,
        );
        return;
    }

    const result = (await addUserToConstitution(uid.unwrap(), cstid.unwrap())).mapErr(
        (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`),
    );
    sendResult(result, res);
}

async function leave(req: Request, res: Response): Promise<void> {
    // TODO : The owner of a constitution should not be able to leave it
    // TODO : If the last user leaves the constitution, should it be deleted ?
    const uid = Option(req.uid);
    if (uid.isNone()) {
        sendResult(
            Err(new HttpError(HttpStatus.InternalError, "missing uid in request, this should never happen")),
            res,
        );
        return;
    }

    const id = Option(req.params["id"]).okOr(
        new HttpError(HttpStatus.BadRequest, "missing constitution id from request"),
    );
    if (id.isErr()) {
        sendResult(id, res);
        return;
    }

    const cstid = Result.safe(() => parseInt(id.unwrap()));
    if (cstid.isErr()) {
        sendResult(
            Err(new HttpError(HttpStatus.BadRequest, `constitution id could not be parse: ${cstid.unwrapErr()}`)),
            res,
        );
        return;
    }

    const result = (await removeUserFromConstitution(uid.unwrap(), cstid.unwrap())).mapErr(
        (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to leave constitution ${err}`),
    );
    sendResult(result, res);
}

const constitutionApiRouter = Router();

constitutionApiRouter.use("/create", ensureAuthMiddleware, create);
constitutionApiRouter.use("/getAll", ensureAuthMiddleware, getAll);
constitutionApiRouter.use("/join/:id", ensureAuthMiddleware, join);
constitutionApiRouter.use("/leave/:id", ensureAuthMiddleware, leave);

export { constitutionApiRouter };
