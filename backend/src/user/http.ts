import { and, eq } from "drizzle-orm";
import { type Request, type Response, Router } from "express";
import { Err, Ok, Option, Result } from "oxide.ts";
import type {
    UserAddArtistShowcaseRequestBody,
    UserAddSongShowcaseRequestBody,
    UserIdResponse,
    UserUpdateRequestBody,
} from "../../../common/user";
import { ensureAuthMiddleware } from "../auth/http";
import { db } from "../db/http";
import { userArtistShowcase, userSongShowcase, users } from "../db/schemas";
import type { DB } from "../db-namespace";
import { getBody, getParam, getReqUID, HttpError, HttpStatus, sendResult } from "../utils";
import { getUidFromHandle, getUser, getUserShowcase } from "./utils";

// GET ROUTES
async function get(req: Request, res: Response): Promise<void> {
    const uid = getParam(req, "uid");

    const user = (await getUser(uid)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get user info from uid ${err}`),
    );
    sendResult(user, res);
}

async function uidFromHandle(req: Request, res: Response): Promise<void> {
    const handle = getParam(req, "handle");

    const uid = (await getUidFromHandle(handle))
        .map(
            (uid): UserIdResponse => ({
                id: uid,
            }),
        )
        .mapErr((err) => new HttpError(HttpStatus.NotFound, `failed to get user info from handle ${err}`));
    sendResult(uid, res);
}

async function getShowcase(req: Request, res: Response): Promise<void> {
    const uid = getParam(req, "uid");

    const result = (await getUserShowcase(uid)).mapErr(
        (err) => new HttpError(HttpStatus.NotFound, `failed to get user showcase from uid ${err}`),
    );

    sendResult(result, res);
}

// POST ROUTES
async function addArtistShowcase(req: Request, res: Response): Promise<void> {
    const uid = getReqUID(req);
    const body = getBody<UserAddArtistShowcaseRequestBody>(req);

    const showcase: DB.Insert.UserArtistShowcase[] = body.artists.map((a) => {
        return { artist: a, user: uid };
    });

    const operation = async () => db.insert(userArtistShowcase).values(showcase);
    const result = (await Result.safe(operation())).mapErr(
        (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to add artist to user showcase ${err}`),
    );

    sendResult(result, res);
}

async function addSongShowcase(req: Request, res: Response): Promise<void> {
    const uid = getReqUID(req);
    const body = getBody<UserAddSongShowcaseRequestBody>(req);

    const showcase: DB.Insert.UserSongShowcase[] = body.songs.map((s) => {
        return { song: s, user: uid };
    });

    const operation = async () => db.insert(userSongShowcase).values(showcase);
    const result = (await Result.safe(operation())).mapErr(
        (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to add song to user showcase ${err}`),
    );

    sendResult(result, res);
}

async function update(req: Request, res: Response): Promise<void> {
    const userInfo = getBody<UserUpdateRequestBody>(req);
    const uid = getReqUID(req);

    // Extract the user info from the request body and update the database
    const queryResult = await db.update(users).set(userInfo).where(eq(users.id, uid)).returning();
    const result = Option(queryResult.at(0))
        .map((val) => val as DB.Select.User)
        .okOr(new HttpError(HttpStatus.InternalError, "failed to update user info"));

    sendResult(result, res);
}

// DELETE ROUTES
async function deleteSongShowcase(req: Request, res: Response): Promise<void> {
    const uid = getReqUID(req);
    const showcaseId = parseInt(getParam(req, "id"), 10);

    const operation = async () =>
        db
            .delete(userSongShowcase)
            .where(and(eq(userSongShowcase.id, showcaseId), eq(userSongShowcase.user, uid)))
            .returning();
    const deletionResult = await Result.safe(operation());
    const result = deletionResult
        .mapErr(
            (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to remove song to user showcase ${err}`),
        )
        .andThen((rows) =>
            rows.length === 0 ? Err(new HttpError(HttpStatus.NotFound, "song showcase not found")) : Ok(rows),
        );

    sendResult(result, res);
}

async function deleteArtistShowcase(req: Request, res: Response): Promise<void> {
    const uid = getReqUID(req);
    const showcaseId = parseInt(getParam(req, "id"), 10);

    const operation = async () =>
        db
            .delete(userArtistShowcase)
            .where(and(eq(userArtistShowcase.id, showcaseId), eq(userArtistShowcase.user, uid)))
            .returning();
    const deletionResult = await Result.safe(operation());
    const result = deletionResult
        .mapErr(
            (err) => new HttpError(HttpStatus.UnprocessableContent, `failed to remove artist to user showcase ${err}`),
        )
        .andThen((rows) =>
            rows.length === 0 ? Err(new HttpError(HttpStatus.NotFound, "artist showcase not found")) : Ok(rows),
        );

    sendResult(result, res);
}

const userApiRouter = Router();

userApiRouter.get("/get/:uid", ensureAuthMiddleware, get);
userApiRouter.get("/get-showcase/:uid", ensureAuthMiddleware, getShowcase);
userApiRouter.get("/uid-from-handle/:handle", ensureAuthMiddleware, uidFromHandle);

userApiRouter.post("/song-showcase", ensureAuthMiddleware, addSongShowcase); // NOTE(victor): consider generic `/showcase` endpoint?
userApiRouter.post("/artist-showcase", ensureAuthMiddleware, addArtistShowcase);
userApiRouter.post("/update", ensureAuthMiddleware, update);

userApiRouter.delete("/artist-showcase/:id", ensureAuthMiddleware, deleteArtistShowcase);
userApiRouter.delete("/song-showcase/:id", ensureAuthMiddleware, deleteSongShowcase);

export { userApiRouter };
