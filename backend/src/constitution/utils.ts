import { and, count, eq } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import type { Unit } from "../../../common/utils.ts";
import { db } from "../db/http.ts";
import { constitutions, songConstitution, userConstitution } from "../db/schemas/index.ts";
import { onSongAddCallback, onUserJoinCallback, onUserLeaveCallback } from "./ws.ts";
import type { DB } from "../db-namepsace.ts";

async function addUserToConstitution(uid: string, cstid: number): Promise<Result<Unit, Error>> {
    const operation = async () =>
        await db
            .insert(userConstitution)
            .values({
                user: uid,
                constitution: cstid,
            })
            .returning();

    return (await Result.safe(operation()))
        .andThen((users) => Option(users.at(0)).okOr(new Error("failed to add user participation in the database")))
        .map((user) => {
            // Update users who were listening to changes
            onUserJoinCallback(user);
            return {};
        });
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

    return (await Result.safe(operation()))
        .andThen((songs) => Option(songs.at(0)).okOr(new Error("failed to insert song into database")))
        .map((song) => {
            // Update users who were listening to changes
            onSongAddCallback(song);
            return {};
        });
}

async function getDBConstitution(id: number): Promise<Result<DB.Select.Constitution, Error>> {
    const operation = async () =>
        await db
            .select()
            .from(constitutions)
            .where(eq(constitutions.id, id));

    return (await Result.safe(operation())).andThen((val) =>
        Option(val.at(0)).okOr(new Error(`No constitution with id: ${id}`)),
    );
}

async function countSongsOfUser(cstid: number, uid: string,): Promise<Result<number, Error>> {
    const operation = async () =>
        await db
            .select({ count: count() })
            .from(songConstitution)
            .where(and(
                eq(songConstitution.user, uid),
                eq(songConstitution.constitution, cstid)
            ));

    return (await Result.safe(operation()))
        .andThen((counts) => Option(counts.at(0)).okOr(new Error(`failed to count songs of user ${uid}`)))
        .map((c) => c.count);
}

async function isMember(uid: string, cstid: number): Promise<Result<boolean, Error>> {
    const operation = async () =>
        await db
            .select()
            .from(userConstitution)
            .where(and(eq(userConstitution.user, uid), eq(userConstitution.constitution, cstid)));

    return (await Result.safe(operation())).map((results) => results.length !== 0);
}

async function removeUserFromConstitution(uid: string, cstid: number): Promise<Result<Unit, Error>> {
    const operation = async () =>
        await db
            .delete(userConstitution)
            .where(and(eq(userConstitution.user, uid), eq(userConstitution.constitution, cstid)))
            .returning();

    return (await Result.safe(operation()))
        .andThen((users) => Option(users.at(0)).okOr(new Error("failed to remove user participation in the database")))
        .map((user) => {
            // Update users who were listening to changes
            onUserLeaveCallback(user);
            return {};
        });
}

export {
    addSongToConstitution,
    addUserToConstitution,
    countSongsOfUser,
    isMember,
    getDBConstitution,
    removeUserFromConstitution
};
