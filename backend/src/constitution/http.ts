import { type Request, type Response, Router } from "express";
import { Err, Option } from "oxide.ts";
import type {
    AddSongConstitutionRequestBody,
    CreateConstitutionRequestBody,
    JoinConstitutionRequestBody,
    LeaveConstitutionRequestBody,
} from "../../../common/constitution";
import { ensureAuthMiddleware } from "../auth/http";
import { getBody, getParam, getReqUID, HttpError, HttpStatus, sendResult, unwrap } from "../utils";
import {
    addSongToConstitution,
    addUserToConstitution,
    countSongsOfUser,
    createConstitution,
    getConstitution,
    getCurrentConstitutionsIDs,
    getDBConstitution,
    isMember,
    removeUserFromConstitution,
} from "./utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
    // TODO : Validate that the user have the permissions to read the constitution info ?
    const id = parseInt(getParam(req, "id"), 10);

    const constitution = (await getConstitution(id)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get constitution info from id: ${err}`),
    );
    sendResult(constitution, res);
}

async function getCurrentIDs(_: Request, res: Response): Promise<void> {
    const ids = (await getCurrentConstitutionsIDs()).mapErr(
        (err) => new HttpError(HttpStatus.InternalError, `failed to get current constitutions IDs: ${err}`),
    );
    sendResult(ids, res);
}

// POST ROUTES
async function addSong(req: Request, res: Response): Promise<void> {
    const uid = getReqUID(req);
    const participation = getBody<AddSongConstitutionRequestBody>(req);

    // Check if the user is a member of the constitution
    const isMemberOfCst = unwrap(
        (await isMember(uid, participation.constitution)).mapErr(
            (err) =>
                new HttpError(
                    HttpStatus.InternalError,
                    `failed to verify if user is member of constitution: ${err.message}`,
                ),
        ),
    );
    if (!isMemberOfCst) {
        sendResult(
            Err(
                new HttpError(
                    HttpStatus.Unauthorized,
                    `user '${uid}' is not a member of constitution '${participation.constitution}'`,
                ),
            ),
            res,
        );
        return;
    }

    // Check if the user already added the maximum number of songs to the constitution
    const constitution = unwrap(
        (await getDBConstitution(participation.constitution)).mapErr(
            (err) =>
                new HttpError(
                    HttpStatus.InternalError,
                    `failed to get constitution '${participation.constitution}' ${err.message}`,
                ),
        ),
    );
    const userSongsCount = unwrap(
        (await countSongsOfUser(participation.constitution, uid)).mapErr(
            (err) =>
                new HttpError(
                    HttpStatus.InternalError,
                    `failed to count songs of user '${uid}' in constitution '${participation.constitution}' ${err.message}`,
                ),
        ),
    );
    if (userSongsCount >= constitution.nSongs) {
        sendResult(
            Err(
                new HttpError(
                    HttpStatus.Unauthorized,
                    `user '${uid}' already added the maximum number of songs (${constitution.nSongs}) to constitution '${participation.constitution}'`,
                ),
            ),
            res,
        );
        return;
    }

    // Add a song to the constitution
    const result = (await addSongToConstitution(participation.constitution, participation.song, uid)).mapErr(
        (err) =>
            new HttpError(
                HttpStatus.UnprocessableContent,
                `failed to add song '${participation.song}' constitution '${participation.constitution}' ${err}`,
            ),
    );

    sendResult(result, res);
}

async function create(req: Request, res: Response): Promise<void> {
    // TODO : Add validation of the permissions of the user (is he allowed to create a constitution ?)
    const uid = getReqUID(req);
    const body = getBody<CreateConstitutionRequestBody>(req);

    const creationResult = (
        await createConstitution({
            name: body.name,
            description: body.description,
            owner: uid,
            nSongs: body.nSongs,
        })
    ).mapErr((err) => new HttpError(HttpStatus.InternalError, `failed to create constitution: ${err}`));

    sendResult(creationResult, res);
}

async function join(req: Request, res: Response): Promise<void> {
    const body = getBody<JoinConstitutionRequestBody>(req);
    const uid = getReqUID(req);

    const id = unwrap(
        Option(body.id).okOr(new HttpError(HttpStatus.BadRequest, "missing constitution id from request")),
    );

    const result = (await addUserToConstitution(uid, id)).mapErr(
        (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to join constitution ${err}`),
    );
    sendResult(result, res);
}

async function leave(req: Request, res: Response): Promise<void> {
    // TODO : The owner of a constitution should not be able to leave it
    // TODO : If the last user leaves the constitution, should it be deleted ?
    const body = getBody<LeaveConstitutionRequestBody>(req);
    const uid = getReqUID(req);

    const id = unwrap(
        Option(body.id).okOr(new HttpError(HttpStatus.BadRequest, "missing constitution id from request")),
    );

    const result = (await removeUserFromConstitution(uid, id)).mapErr(
        (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to leave constitution ${err}`),
    );
    sendResult(result, res);
}

const constitutionApiRouter = Router();

constitutionApiRouter.get("/getCurrentIDs", ensureAuthMiddleware, getCurrentIDs);
constitutionApiRouter.get("/get/:id", ensureAuthMiddleware, get);

constitutionApiRouter.post("/addSong", ensureAuthMiddleware, addSong);
constitutionApiRouter.post("/create", ensureAuthMiddleware, create);
constitutionApiRouter.post("/join", ensureAuthMiddleware, join);
constitutionApiRouter.post("/leave", ensureAuthMiddleware, leave);

export { constitutionApiRouter };
