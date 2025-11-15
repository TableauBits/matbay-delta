import type { constitutions, userConstitution } from "./constitutions/schema";
import type { artists, songArtist, songs } from "./songs/schema";
import type { users } from "./user/schema";

// biome-ignore lint/style/useNamingConvention: DB namespace being uppercase is not problematic
export namespace DB {
    export namespace Insert {
        export type Artist = typeof artists.$inferInsert;
        export type Song = typeof songs.$inferInsert;
        export type SongArtist = typeof songArtist.$inferInsert;
        export type User = typeof users.$inferInsert;
        export type UserConstitution = typeof userConstitution.$inferInsert;
    }

    export namespace Select {
        export type Artist = typeof artists.$inferSelect;
        export type Constitution = typeof constitutions.$inferSelect;
        export type Song = typeof songs.$inferSelect;
        export type User = typeof users.$inferSelect;
        export type UserConstitution = typeof userConstitution.$inferSelect;
    }
}
