import { Schema, model } from "mongoose";

export interface IVanity{
    name: string;
    steamId: string;
    createdAt: Date;
}

const vanitySchema = new Schema<IVanity>({
    name: {type:String, required: true, lowercase: true, unique: true},
    steamId: {type: String, required: true},
    createdAt: {type: Date, default: Date.now, expires:"7d"}
})

const VanityName = model<IVanity>("VanityName", vanitySchema)

export default VanityName