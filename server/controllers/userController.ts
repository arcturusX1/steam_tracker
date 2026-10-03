import type { Request, Response } from "express";
import { resolveSteamIdCached, getProfileCached, getOwnedGamesCached } from "../services/userService.ts"
import {toHours} from "../services/utils/mappers.ts"
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
    const profile = await getProfileCached(steamId);

    res.json(profile);
}

export async function getUserGames(req: Request<URLParams>, res: Response){
    const input = paramsValidator(req.params.input);
    const steamId = await resolveSteamIdCached(input);
    const games = await getOwnedGamesCached(steamId);

    if(!games){
        throw  new HttpError(403, `User profile is private`)
    }

    const totalPlaytimeHours = games.reduce((sum, game) => sum + game.playtimeHours ,0);

    res.json({
        steamId,
        gameCount: games.length,
        totalPlaytimeHours: Math.round(totalPlaytimeHours),
        games
    })

}