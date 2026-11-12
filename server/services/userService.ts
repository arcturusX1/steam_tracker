import User from "../models/User.ts"
import VanityName from "../models/VanityName.ts"
import { parseIdOrVanity, lookupVanityName, getPlayerSummary, getOwnedGames, getTopAchievements } from "./steamService.ts"
import type { UserProfile, UserGame, AchievementCount } from "./utils/mappers.ts";
import { toProfile, toGame, toAchievementCount } from "./utils/mappers.ts";
import { isFresh } from "./utils/isFresh.ts";

const PROFILE_MAX_AGE = 600000;
const GAMES_MAX_AGE = 3600000;
const TOP_GAMES_COUNT = 4;

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

export async function getProfileCached(steamId: string): Promise<UserProfile>{
    //find if user is cached
    const cached = await User.findOne({steamId: steamId}).lean()
    const isProfileFresh = isFresh(cached?.profileFetchedAt, PROFILE_MAX_AGE);

    if(cached && cached.profile && isProfileFresh){
        return cached.profile
    }

    //cache miss: get player
    const player = await getPlayerSummary(steamId);
    const profile = toProfile(player);
    
    //cache profile
    await User.updateOne({steamId}, {$set: {profile, profileFetchedAt: new Date()}}, {upsert: true})

    return profile

}

export async function getOwnedGamesCached(steamId: string): Promise<UserGame[] | null>{
    //only get the games from user
    const cached = await User.findOne({steamId: steamId}).select("games gamesFetchedAt").lean();
    const isGameFresh = isFresh(cached?.gamesFetchedAt, GAMES_MAX_AGE);

    if(cached && isGameFresh){
        return cached.games
    }
    
    //cache miss
    const ownedGames = await getOwnedGames(steamId);
    //null means private profile
    const games = ownedGames? ownedGames.map(toGame) : null;

    //sort by most played
    games?.sort((a,b)=> b.playtimeHours - a.playtimeHours);

    //cache the results .updateOne({filter}, {$set: {val1, val2,...}}, {upsert: true})
    await User.updateOne({steamId}, {$set: {games, gamesFetchedAt: new Date()}}, {upsert: true});

    return games;
}

//achievement counts for the user's most played games. games must already be sorted most played first.
//cached with its own timestamp, and refetched early if the top games have changed since
export async function getTopAchievementsCached(steamId: string, games: UserGame[]): Promise<AchievementCount[]>{
    const topAppIds = games.slice(0, TOP_GAMES_COUNT).map((game) => game.appId);
    if (topAppIds.length === 0){
        return [];
    }

    const cached = await User.findOne({steamId}).select("topAchievements topAchievementsFetchedAt").lean();
    const cachedAppIds = cached?.topAchievements?.map((count) => count.appId) ?? [];
    const sameGames = cachedAppIds.length === topAppIds.length && topAppIds.every((appId) => cachedAppIds.includes(appId));

    if(cached?.topAchievements && sameGames && isFresh(cached.topAchievementsFetchedAt, GAMES_MAX_AGE)){
        return cached.topAchievements;
    }

    //cache miss
    const counts = (await getTopAchievements(steamId, topAppIds)).map(toAchievementCount);
    await User.updateOne({steamId}, {$set: {topAchievements: counts, topAchievementsFetchedAt: new Date()}}, {upsert: true});

    return counts;
}
