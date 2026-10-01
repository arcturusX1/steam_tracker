import type { Request, Response } from "express";
import {
    resolveSteamId,
    getPlayerSummary,
    getOwnedGames
} from "../services/steamService.ts"
import type { PlayerSummary, OwnedGame } from "../services/types/steamResponseTypes.ts";
import { HttpError } from "../services/utils/HttpError.ts";

const MAX_INPUT_LENGTH = 200;
const ICON_BASE_URL = "https://media.steampowered.com/steamcommunity/public/images/apps";
const userStatus = ["offline", "online", "busy", "away", "snooze", "looking to trade", "looking to play"];

interface URLParams{
    input: string
};


function paramsValidator(raw: string):string{
    const input = raw.trim()
    if (!input || input.length > MAX_INPUT_LENGTH){
        throw new HttpError(400, `Input must be within 1-${MAX_INPUT_LENGTH} characters`)

    }
    return input
}

//time conversion helpers
function toIsoDate(seconds?: number): string | null{
    return seconds? new Date(seconds * 1000).toISOString() : null
}

function toHours(minutes: number): number{
    return Math.round((minutes/60)*10)/10;
}

//returns fetched data from service
function toProfile(player: PlayerSummary) {
  return {
    steamId: player.steamid,
    name: player.personaname,
    avatar: player.avatarfull,
    profileUrl: player.profileurl,
    status: userStatus[player.personastate] ?? "unknown",
    isPublic: player.communityvisibilitystate === 3,
    createdAt: toIsoDate(player.timecreated),
  };
}

function toGame(game: OwnedGame) {
  return {
    appId: game.appid,
    name: game.name,
    playtimeHours: toHours(game.playtime_forever),
    recentHours: toHours(game.playtime_2weeks ?? 0),
    iconUrl: game.img_icon_url ? `${ICON_BASE_URL}/${game.appid}/${game.img_icon_url}.jpg` : null,
    lastPlayed: toIsoDate(game.rtime_last_played),
  };
}

export async function getUser(req: Request<URLParams>, res: Response){
    const validParams = paramsValidator(req.params.input)
    
    const steamId = await resolveSteamId(validParams);
    const user = await getPlayerSummary(steamId);

    res.json(toProfile(user));
}

export async function getUserGames(req: Request<URLParams>, res: Response){
    const validParams = paramsValidator(req.params.input);
    const steamId = await resolveSteamId(validParams);
    const ownedGames = await getOwnedGames(steamId);

    if(!ownedGames){
        throw  new HttpError(403, `User profile is private`)
    }

    const totalPlaytimeMins = ownedGames.reduce((sum, game) => sum + game.playtime_forever ,0);

    const games = ownedGames.map(toGame);
    games.sort((a,b)=> b.playtimeHours - a.playtimeHours)

    res.json({
        steamId,
        gameCount: games.length,
        totalPlaytimeHours: toHours(totalPlaytimeMins),
        games
    })

}