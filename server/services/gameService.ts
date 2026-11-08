import { toGameDetails, type GameDetails } from "./utils/mappers.ts";
import { isFresh } from "./utils/isFresh.ts";
import Game from "../models/Game.ts";
import { getAppDetails } from "./steamService.ts";

const GAME_DETAILS_MAX_AGE = 86400000;

export async function getGameDetailsCached(appId: number):Promise<GameDetails>{
    const cached = await Game.findOne({appId}).lean();

    if(cached && isFresh(cached.detailsFetchedAt, GAME_DETAILS_MAX_AGE)){
        return cached.details
    }
    const game = await getAppDetails(appId);
    const details = toGameDetails(game);
    await Game.updateOne({appId}, {$set: {details, detailsFetchedAt: new Date()}}, {upsert: true})

    return details

}
