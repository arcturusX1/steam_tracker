import type { Request, Response } from "express";
import { getPlayerSummary, getOwnedGames } from "../services/steamService.ts"
import { resolveSteamIdCached } from "../services/userService.ts"
import {toProfile, toGame, toHours} from "../services/utils/mappers.ts"
import { HttpError } from "../services/utils/HttpError.ts";

const MAX_INPUT_LENGTH = 200;

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

export async function getUser(req: Request<URLParams>, res: Response){
    const input = paramsValidator(req.params.input)

    const steamId = await resolveSteamIdCached(input);
    const player = await getPlayerSummary(steamId);

    res.json(toProfile(player));
}

export async function getUserGames(req: Request<URLParams>, res: Response){
    const input = paramsValidator(req.params.input);
    const steamId = await resolveSteamIdCached(input);
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