import type { constitutions, userConstitution } from "./constitutions/schema";
import type { users } from "./user/schema";

export namespace DB {
    export type Constitution = typeof constitutions.$inferSelect;
    export type User = typeof users.$inferSelect;
    export type UserConstitution = typeof userConstitution.$inferSelect;
}
