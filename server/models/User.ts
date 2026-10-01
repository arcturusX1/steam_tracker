import { Schema, model } from "mongoose";
import type { UserProfile, UserGame } from "../services/utils/mappers.ts";

//gets shaped data from mappers.ts
export interface IUser{
    steamId: string,
    profile?: UserProfile;
    profileFetchedAt?: Date;
    games: UserGame[] | null;
    gamesFetchedAt: Date | null;
}

const profileSchema = new Schema<UserProfile>(
  {
    steamId: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String, required: true },
    profileUrl: { type: String, required: true },
    status: { type: String, required: true },
    isPublic: { type: Boolean, required: true },
    createdAt: { type: String, default: null },
  },
  { _id: false }
);

const gameSchema = new Schema<UserGame>(
  {
    appId: { type: Number, required: true },
    name: { type: String, required: true },
    playtimeHours: { type: Number, required: true },
    recentHours: { type: Number, default: 0 },
    iconUrl: { type: String, default: null },
    lastPlayed: { type: String, default: null },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    steamId: { type: String, required: true, unique: true },
    profile: { type: profileSchema },
    profileFetchedAt: { type: Date },
    games: { type: [gameSchema], default: null },
    gamesFetchedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = model<IUser>("User", userSchema);

export default User