import { Router } from "express";
import { getGameDetails } from "../controllers/gameController.ts";

const gamesRouter = Router();

gamesRouter.get("/:appId", getGameDetails)

export default gamesRouter