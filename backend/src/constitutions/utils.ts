import { and, eq } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import type { Unit } from "../../../common/utils.ts";
import { db } from "../db/http";
import { songConstitution, userConstitution } from "../db/schemas";
import type { DB } from "../db-namepsace";
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

    const insertResult = (await Result.safe(operation()))
        .andThen((users) => Option(users.at(0)).okOr(new Error("failed to add user participation in the database")))
        .map((user) => {
            // Update users who were listening to changes
            onUserJoinCallback(user);
            return user;
        });

    return insertResult;
}

async function addSongToConstitution(constitution: number, song: number, user: string): Promise<Result<Unit, Error>> {
    const operation = async () =>
        await db
            .insert(songConstitution)
            .values({
                constitution,
                song,
                user,
            })
            .returning();

    const insertResult = (await Result.safe(operation()))
        .andThen((songs) => Option(songs.at(0)).okOr(new Error("failed to insert song into database")))
        .map((song) => {
            // Update users who were listening to changes
            onSongAddCallback(song);
            return {};
        });

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

    const removeResult = (await Result.safe(operation()))
        .andThen((users) => Option(users.at(0)).okOr(new Error("failed to remove user participation in the database")))
        .map((user) => {
            // Update users who were listening to changes
            onUserLeaveCallback(user);
            return user;
        });

    return removeResult;
}

export { addSongToConstitution, addUserToConstitution, isMember, removeUserFromConstitution };
