import { count } from "drizzle-orm";
import { Option, Result } from "oxide.ts";
import type { GlobalStats } from "../../../common/stat";
import { db } from "../db/http";
import { songs, users, artists, constitutions } from "../db/schemas";

async function getGlobalStats(): Promise<Result<GlobalStats, Error>> {
  const results = await Result.safe(
    Promise.all([
      db.select({ users: count() }).from(users),
      db.select({ songs: count() }).from(songs),
      db.select({ artists: count() }).from(artists),
      db.select({ constitutions: count() }).from(constitutions),
    ]),
  );

  return results.andThen(([userRows, songRows, artistRows, constitutionRows]) =>
    Option(userRows.at(0))
      .andThen((userRow) =>
        Option(songRows.at(0)).andThen((songRow) =>
          Option(artistRows.at(0)).andThen((artistRow) =>
            Option(constitutionRows.at(0)).map((constitutionRow) => ({
              users: userRow.users,
              songs: songRow.songs,
              artists: artistRow.artists,
              constitutions: constitutionRow.constitutions,
            })),
          ),
        ),
      )
      .okOr(new Error("failed to retrieve global stats from database")),
  );
}

export { getGlobalStats };
