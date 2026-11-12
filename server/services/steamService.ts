import axios from "axios";
import { HttpError } from "./utils/HttpError.ts";

import type {
  VanityResponse,
  PlayerSummary,
  PlayerSummariesResponse,
  OwnedGame,
  OwnedGamesResponse,
  TopAchievementsGame,
  TopAchievementsResponse,
  AppDetailsData,
  AppDetailsResponse
} from "./types/steamResponseTypes.ts";


const steamConnector = axios.create({
    baseURL: process.env.STEAM_API_URL,
    timeout: 10000
});

const STORE_BASE_URL = "https://store.steampowered.com/api"

const storeConnector = axios.create({
    baseURL: STORE_BASE_URL,
    timeout: 10000
})

//<T> == Generic T, type changes depending on caller 
// Record<string, string | number> describes an object with string keys
// and string-or-number values. The spread operator copies those entries
// into the request params object.

async function steamGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> { 
    try{
        const res = await steamConnector.get<T>(path,{
            params: {...params, key:process.env.STEAM_API_KEY, format: "json"}
        });
        return res.data;
    }catch (err){
        handleSteamError(err, path)
    }

}

async function storeGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> { 
    try{
        const res = await storeConnector.get<T>(path,{
            params: params
        });
        return res.data;
    }catch (err){
        handleSteamError(err, path)
    }

}

const STEAM_ID64 = /^\d{17}$/; //a steamId is exactly 17 digits

//either the input already is a steamId, or it's a vanity name to look up
export type ParsedSteamInput = { steamId: string } | { vanityName: string };

//works out what the user typed (steamId, vanity name, or profile URL) without calling steam
export function parseIdOrVanity(input: string): ParsedSteamInput {
  const trimmed = input.trim();

  //profile URL: steamcommunity.com/profiles/<steamId>
  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/(\d{17})/);
  if (profileMatch) return { steamId: profileMatch[1] };

  //custom URL: steamcommunity.com/id/<vanityName>
  const vanityMatch = trimmed.match(/steamcommunity\.com\/id\/([^/]+)/);
  const value = vanityMatch ? vanityMatch[1] : trimmed;

  if (STEAM_ID64.test(value)) return { steamId: value };
  return { vanityName: value };
}

//vanity name -> steamId ->/ISteamUser/ResolveVanityURL/v1/
export async function lookupVanityName(vanityName: string): Promise<string> {
  const data = await steamGet<VanityResponse>("/ISteamUser/ResolveVanityURL/v1/", { vanityurl: vanityName }); // this endpoint wasn't in valve's api guide

  if (data.response.success !== 1 || !data.response.steamid) {
    throw new HttpError(404, `No Steam user found for "${vanityName}"`);
  }
  return data.response.steamid;
}



//player summary feature -> ISteamUser/GetPlayerSummaries/v2
export async function getPlayerSummary(steamId: string): Promise<PlayerSummary> {
    const data = await steamGet<PlayerSummariesResponse>("/ISteamUser/GetPlayerSummaries/v2/", {
        steamids: steamId,}); //can accept multiple keys so steamids. 
        //no formatting to json? solved: steamGet formats to json by design

    const player = data.response.players[0]
    if (!player){
        throw new HttpError(404, "Steam profile does not exist")
    }
    return player;
}

//get owned games -> /IPlayerService/GetOwnedGames/v1/
export async function getOwnedGames(steamId: string): Promise<OwnedGame[] | null>{
    const data = await steamGet<OwnedGamesResponse>("/IPlayerService/GetOwnedGames/v1/", {
        steamid: steamId,
        include_appinfo: 1, //includes game info and logos. default returns only appid
        include_played_free_games: 1,
    });
    return data.response.games ?? null;
}

//above any real game's achievement count, so steam lists every unlocked achievement
const MAX_ACHIEVEMENTS = 10000;

//achievement counts for several games in one call -> /IPlayerService/GetTopAchievementsForGames/v1/
//steam wants the ids as appids[0], appids[1], ... so each one gets its own numbered param
export async function getTopAchievements(steamId: string, appIds: number[]): Promise<TopAchievementsGame[]>{
    const params: Record<string, string | number> = {
        steamid: steamId,
        language: "english",
        max_achievements: MAX_ACHIEVEMENTS,
    };
    appIds.forEach((appId, index) => {
        params[`appids[${index}]`] = appId;
    });

    const data = await steamGet<TopAchievementsResponse>("/IPlayerService/GetTopAchievementsForGames/v1/", params);
    //private game details give response: {}
    return data.response.games ?? [];
}

export async function getAppDetails(appId: number): Promise<AppDetailsData>{
    const data = await storeGet<AppDetailsResponse | null>("/appdetails", {
        appids: appId,
        l: "english"
    });
    if (!data){
        throw new HttpError(502, "Steam Store Error")
    }
    const entry = data[String(appId)]
    if (!entry || !entry.success){
        throw new HttpError(404, `No store page for app ${appId}`)
    }
    return entry.data
}

function handleSteamError(err: unknown, label: string): never{
    if (axios.isAxiosError(err)){
            const status = err.response?.status;
            console.error(`Steam error: ${label}`, status ?? err.code);

            if (status ===429) throw new HttpError(429, "Steam rate limit reached, try later");
            throw new HttpError(502, "Steam API request failed")
        }throw err;
}
