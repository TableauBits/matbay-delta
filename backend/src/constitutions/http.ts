import { type Request, type Response, Router } from "express";
import { Err, Ok, Option } from "oxide.ts";
import type {
    AddSongConstitutionRequestBody,
    CreateConstitutionRequestBody,
    JoinConstitutionRequestBody,
    LeaveConstitutionRequestBody,
} from "../../../common/constitution";
import { ensureAuthMiddleware } from "../auth/http";
import { db } from "../db/http";
import { getBody, getReqUID, HttpError, HttpStatus, sendResult } from "../utils";
import { constitutions } from "./schema";
import {
    addSongToConstitution,
    addUserToConstitution,
    isMember,
    removeUserFromConstitution,
    searchSongs,
} from "./utils";

// GET ROUTES
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
            songConstitution: {
                columns: {
                    song: true,
                    user: true,
                    addDate: true,
                },
            },
        },
    });

    sendResult(Ok(allConstitutions), res);
}

// TODO : Still necessary ?
async function getSongs(req: Request, res: Response): Promise<void> {
    // Check if the user is in the user list of the constitution
    const uid = getReqUID(req);
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    const cstid = Option(req.params["id"])
        .map((val) => parseInt(val))
        .okOr(new HttpError(HttpStatus.BadRequest, "missing constitution id from request"));

    if (cstid.isErr()) {
        sendResult(cstid, res);
        return;
    }

    const authorized = (await isMember(uid.unwrap(), cstid.unwrap())).mapErr(
        () => new HttpError(HttpStatus.Unauthorized, "You are not authorized to inspect this constitution"),
    );
    if (authorized.isErr() || !authorized.unwrap()) {
        sendResult(authorized, res);
        return;
    }

    // Get all the songs of the constitution
    const songs = (await searchSongs(cstid.unwrap())).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to fetch songs from constitution: ${err}`),
    );
    sendResult(songs, res);
}

// POST ROUTES
async function addSong(req: Request, res: Response): Promise<void> {
    const uid = getReqUID(req);
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    const body = getBody<AddSongConstitutionRequestBody>(req);
    if (body.isErr()) {
        sendResult(body, res);
        return;
    }

    const participation = body.unwrap();
    const result = (await addSongToConstitution(participation.constitution, participation.song, uid.unwrap()))
        .map(() => {
            return {};
        })
        .mapErr(
            (err) =>
                new HttpError(
                    HttpStatus.UnprocessableContent,
                    `failed to add song '${participation.song}' constitution '${participation.constitution}' ${err}`,
                ),
        );

    sendResult(result, res);
}

async function create(req: Request, res: Response): Promise<void> {
    // TODO : Add validation of the body
    // TODO : Add validation of the permissions of the user (is he allowed to create a constitution ?)

    const uid = getReqUID(req);
    if (uid.isErr()) {
        sendResult(uid, res);
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
    sendResult(
        (await addUserToConstitution(uid.unwrap(), cstid.unwrap()))
            .map(() => {
                return {};
            })
            .mapErr((err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`)),
        res,
    );
}

async function join(req: Request, res: Response): Promise<void> {
    const body = getBody<JoinConstitutionRequestBody>(req);
    if (body.isErr()) {
        sendResult(body, res);
        return;
    }

    const uid = getReqUID(req);
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    const id = Option(body.unwrap().id).okOr(
        new HttpError(HttpStatus.BadRequest, "missing constitution id from request"),
    );
    if (id.isErr()) {
        sendResult(id, res);
        return;
    }

    const result = (await addUserToConstitution(uid.unwrap(), id.unwrap()))
        .map(() => {
            return {};
        })
        .mapErr((err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`));
    sendResult(result, res);
}

async function leave(req: Request, res: Response): Promise<void> {
    // TODO : The owner of a constitution should not be able to leave it
    // TODO : If the last user leaves the constitution, should it be deleted ?
    const body = getBody<LeaveConstitutionRequestBody>(req);
    if (body.isErr()) {
        sendResult(body, res);
        return;
    }

    const uid = getReqUID(req);
    if (uid.isErr()) {
        sendResult(uid, res);
        return;
    }

    const id = Option(body.unwrap().id).okOr(
        new HttpError(HttpStatus.BadRequest, "missing constitution id from request"),
    );
    if (id.isErr()) {
        sendResult(id, res);
        return;
    }

    const result = (await removeUserFromConstitution(uid.unwrap(), id.unwrap()))
        .map(() => {
            return {};
        })
        .mapErr((err) => new HttpError(HttpStatus.UnprocessableContent, `failed to leave constitution ${err}`));
    sendResult(result, res);
}

const constitutionApiRouter = Router();

constitutionApiRouter.get("/getAll", ensureAuthMiddleware, getAll); // Debug route ?
constitutionApiRouter.get("/getSongs/:id", ensureAuthMiddleware, getSongs);

constitutionApiRouter.post("/addSong", ensureAuthMiddleware, addSong);
constitutionApiRouter.post("/create", ensureAuthMiddleware, create);
constitutionApiRouter.post("/join", ensureAuthMiddleware, join);
constitutionApiRouter.post("/leave", ensureAuthMiddleware, leave);

export { constitutionApiRouter };
