import { Schema, model } from "mongoose";
import type { GameDetails } from "../services/utils/mappers.ts";

export interface IGame{
    appId: number;
    details: GameDetails,
    detailsFetchedAt: Date,
}

const detailsSchema = new Schema<GameDetails>(
    {
        appId: {type: Number, required: true },
        name: {type: String, required: true },
        appType: {type: String, required: true },
        shortDescription: {type: String, required: true },
        headerImage: {type: String, required: true },
        website: {type: String, default: null },
        developers: { type: [String] },
        publishers: {type: [String] },
        genres: {type: [String]},
        platforms: {type: [String]},
        releaseDate: {type: String, default: null },
        comingSoon: {type: Boolean, required: true},
        isFree: {type: Boolean, required: true },
        metacriticScore: {type: Number, default: null},
        recommendations: {type: Number, default: null},
        achievementCount: {type: Number, default: 0},
        storeUrl: {type: String, required: true}
    },
    {_id: false}

)

const gameSchema = new Schema<IGame>(
    {
        appId: {type: Number, required: true, unique: true},
        details: {type: detailsSchema, required: true},
        detailsFetchedAt: {type: Date, required: true},
    },
    {timestamps: true}
)

const Game = model<IGame>("Game", gameSchema)

export default Game
