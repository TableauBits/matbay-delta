import { eq, sql } from "drizzle-orm";
import { Result } from "oxide.ts";
import type { GlobalStats, UserStats } from "../../../common/stat";
import { db } from "../db/http";
import { artists, constitutions, songConstitution, songs, userConstitution, users } from "../db/schemas";

async function getUserStats(uid: string): Promise<Result<UserStats, Error>> {  
    const operation = async () => {  
        const stats = db  
            .select({  
                constitutions: db.$count(userConstitution, eq(userConstitution.user, uid)),  
                songs: db.$count(songConstitution, eq(songConstitution.user, uid)),  
            })  
            .from(sql`(select 1)`) // no-op table 
            .get();  

        if (!stats) throw new Error(`failed to retrieve user stats for user ${uid} from database`);  
        return stats;  
    };  
    return Result.safe(operation());  
}  

async function getGlobalStats(): Promise<Result<GlobalStats, Error>> {  
    const operation = async () => {  
        const stats = db  
            .select({  
                users: db.$count(users),  
                songs: db.$count(songs),  
                artists: db.$count(artists),  
                constitutions: db.$count(constitutions),  
            })  
            .from(sql`(select 1)`) // no-op table 
            .get();  

        if (!stats) throw new Error("failed to retrieve global stats from database");  
        return stats;  
    };  
    return Result.safe(operation());  
}  

export { getGlobalStats, getUserStats };
