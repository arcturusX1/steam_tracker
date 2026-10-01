import { Router } from "express";
import { getUser, getUserGames } from "../controllers/userController.ts";

const userRouter = Router();

userRouter.get("/:input", getUser)

userRouter.get("/:input/games", getUserGames)

export default userRouter;