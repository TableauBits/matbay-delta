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
import { getBody, getParam, getReqUID, HttpError, HttpStatus, sendResult, unwrapHTTP } from "../utils";
import {
    addSongToConstitution,
    addUserToConstitution,
    isMember,
    removeUserFromConstitution,
    searchSongs,
} from "./utils";
import { constitutions } from "../db/schemas";

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
    const cstid = parseInt(getParam(req, "id"));

    unwrapHTTP(
        (await isMember(uid, cstid))
            .map((authorized) => {
                if (!authorized) return Err("not authorized");
                return Ok(authorized);
            })
            .flatten()
            .mapErr(
                () => new HttpError(HttpStatus.Unauthorized, "You are not authorized to inspect this constitution"),
            ),
    );

    // Get all the songs of the constitution
    const songs = (await searchSongs(cstid)).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to fetch songs from constitution: ${err}`),
    );
    sendResult(songs, res);
}

// POST ROUTES
async function addSong(req: Request, res: Response): Promise<void> {
    const uid = getReqUID(req);
    const participation = getBody<AddSongConstitutionRequestBody>(req);

    const result = (await addSongToConstitution(participation.constitution, participation.song, uid))
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
    const body = getBody<CreateConstitutionRequestBody>(req);

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
    const cstid = unwrapHTTP(
        Option(queryResult[0]?.id).okOr(
            new HttpError(HttpStatus.InternalError, "failed to create constitution. no id returned"),
        ),
    );

    // Add the user as a participant of the constitution
    // TODO : This should be done in a transaction ?
    sendResult(
        (await addUserToConstitution(uid, cstid))
            .map(() => {
                return {};
            })
            .mapErr((err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`)),
        res,
    );
}

async function join(req: Request, res: Response): Promise<void> {
    const body = getBody<JoinConstitutionRequestBody>(req);
    const uid = getReqUID(req);

    const id = unwrapHTTP(
        Option(body.id).okOr(new HttpError(HttpStatus.BadRequest, "missing constitution id from request")),
    );

    const result = (await addUserToConstitution(uid, id))
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
    const uid = getReqUID(req);

    const id = unwrapHTTP(
        Option(body.id).okOr(new HttpError(HttpStatus.BadRequest, "missing constitution id from request")),
    );

    const result = (await removeUserFromConstitution(uid, id))
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
