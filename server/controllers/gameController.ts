import { getGameDetailsCached } from "../services/gameService.ts";
import type { Request, Response } from "express";
import { HttpError } from "../services/utils/HttpError.ts";

const APP_ID_LEN = /^\d{1,10}$/;

function parseAppId(raw: string): number{
    if (APP_ID_LEN.test(raw)){
        return Number(raw)
    }
    throw  new HttpError(400, "App ID must be a number")
}
interface gameParams{
    appId: string;
}
export async function getGameDetails(req: Request<gameParams>, res: Response){
    const parsedAppId = parseAppId(req.params.appId)
    const details = await getGameDetailsCached(parsedAppId)
    res.json(details)
}