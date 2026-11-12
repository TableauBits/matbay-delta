import { count, eq } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import type { GlobalStats, UserStats } from "../../../common/stat";
import { db } from "../db/http";
import { artists, constitutions, songConstitution, songs, userConstitution, users } from "../db/schemas";

async function getUserStats(uid: string): Promise<Result<UserStats, Error>> {
    const results = await Result.safe(
        Promise.all([
            db.select({ count: count() }).from(userConstitution).where(eq(userConstitution.user, uid)),
            db.select({ count: count() }).from(songConstitution).where(eq(songConstitution.user, uid)),
        ]),
    );
    // Count all the songs added by the user, even duplicates.

    return results.andThen(([userConstitutionRows, songConstitutionRows]) =>
        Option(userConstitutionRows.at(0))
            .andThen((userConstitutionRow) =>
                Option(songConstitutionRows.at(0)).map((songConstitutionRow) => ({
                    constitutions: userConstitutionRow.count,
                    songs: songConstitutionRow.count,
                })),
            )
            .okOr(new Error(`failed to retrieve user stats for user ${uid} from database`)),
    );
}

async function getGlobalStats(): Promise<Result<GlobalStats, Error>> {
    const results = await Result.safe(
        Promise.all([
            db.select({ count: count() }).from(users),
            db.select({ count: count() }).from(songs),
            db.select({ count: count() }).from(artists),
            db.select({ count: count() }).from(constitutions),
        ]),
    );

    return results.andThen(([userRows, songRows, artistRows, constitutionRows]) =>
        Option(userRows.at(0))
            .andThen((userRow) =>
                Option(songRows.at(0)).andThen((songRow) =>
                    Option(artistRows.at(0)).andThen((artistRow) =>
                        Option(constitutionRows.at(0)).map((constitutionRow) => ({
                            users: userRow.count,
                            songs: songRow.count,
                            artists: artistRow.count,
                            constitutions: constitutionRow.count,
                        })),
                    ),
                ),
            )
            .okOr(new Error("failed to retrieve global stats from database")),
    );
}

export { getGlobalStats, getUserStats };
