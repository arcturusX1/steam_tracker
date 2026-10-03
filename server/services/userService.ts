import User from "../models/User.ts"
import VanityName from "../models/VanityName.ts"
import { parseIdOrVanity, lookupVanityName } from "./steamService.ts"
import type { UserProfile } from "./utils/mappers.ts";

const PROFILE_MAX_AGE = 600000;
const GAMES_MAX_AGE = 3600000;

//input (steamId, vanity name, or profile URL) -> steamId. checks the vanity cache before calling steam
export async function resolveSteamIdCached(input: string): Promise<string>{
    const parsed = parseIdOrVanity(input);
    if ("steamId" in parsed){
        return parsed.steamId;
    }

    //vanity names aren't case sensitive, so the cache stores them lowercased
    const vanityName = parsed.vanityName.toLowerCase();

    const cached = await VanityName.findOne({ vanityName }).lean();
    if (cached){
        return cached.steamId;
    }

    //cache miss: ask steam, then store it. upsert avoids a duplicate key error if two requests race
    const steamId = await lookupVanityName(vanityName);
    await VanityName.updateOne({ vanityName }, { $set: { steamId } }, { upsert: true });
    return steamId;
}

// export async function getProfileCached(input: string): Promise<UserProfile>{

// }

// export async function getGamesCached(input: string): Promise<OwnedGame>{

// }

// function isFreshProfile(profileFetchedAt){

// }

// function isFreshGame(){}
