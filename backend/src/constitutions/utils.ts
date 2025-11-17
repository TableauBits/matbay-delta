import { and, eq } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import { db } from "../db/http";
import type { DB } from "../db-namepsace";
import { songConstitution, userConstitution } from "./schema";
import { onSongAddCallback, onUserJoinCallback, onUserLeaveCallback } from "./ws";

async function addUserToConstitution(uid: string, cstid: number): Promise<Result<DB.Insert.UserConstitution, Error>> {
    const operation = async () =>
        await db
            .insert(userConstitution)
            .values({
                user: uid,
                constitution: cstid,
            })
            .returning();

    const insertResult = (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.UserConstitution);

    // Update users who were listening to changes
    if (insertResult.isOk()) onUserJoinCallback(insertResult.unwrap());

    return insertResult;
}

async function addSongToConstitution(
    constitution: number,
    song: number,
    user: string,
): Promise<Result<DB.Insert.SongConstitution, Error>> {
    const operation = async () =>
        await db
            .insert(songConstitution)
            .values({
                constitution,
                song,
                user,
            })
            .returning();

    const insertResult = (await Result.safe(operation())).map((vals) => vals[0] as DB.Select.SongConstitution);

    // Update users who were listening to changes
    if (insertResult.isOk()) onSongAddCallback(insertResult.unwrap());

    return insertResult;
}

async function isMember(uid: string, cstid: number): Promise<Result<boolean, Error>> {
    const operation = async () =>
        await db
            .select()
            .from(userConstitution)
            .where(and(eq(userConstitution.user, uid), eq(userConstitution.constitution, cstid)));

    return (await Result.safe(operation())).map((results) => results.length !== 0);
}

async function removeUserFromConstitution(
    uid: string,
    cstid: number,
): Promise<Result<DB.Select.UserConstitution, Error>> {
    const operation = async () =>
        await db
            .delete(userConstitution)
            .where(and(eq(userConstitution.user, uid), eq(userConstitution.constitution, cstid)))
            .returning();

    const removeResult = (await Result.safe(operation())).map((vals) => Option(vals[0]));
    if (removeResult.isErr()) return removeResult;

    const removeRow = removeResult.unwrap().okOr(new Error("nothing to remove"));

    // Update users who were listening to changes
    if (removeRow.isOk()) onUserLeaveCallback(removeRow.unwrap());

    return removeRow;
}

async function searchSongs(cstid: number): Promise<Result<DB.Select.SongConstitution[], Error>> {
    const operation = async () =>
        await db.select().from(songConstitution).where(eq(songConstitution.constitution, cstid));

    return await Result.safe(operation());
}

export { addUserToConstitution, addSongToConstitution, isMember, removeUserFromConstitution, searchSongs };
