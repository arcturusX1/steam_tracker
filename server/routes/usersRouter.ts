import { Router } from "express";
import { getUser, getUserGames, getUserAchievements } from "../controllers/userController.ts";

const userRouter = Router();

userRouter.get("/:input", getUser)

userRouter.get("/:input/games", getUserGames)

userRouter.get("/:input/achievements", getUserAchievements)

export default userRouter;