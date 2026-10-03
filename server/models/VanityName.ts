import { Schema, model } from "mongoose";

//one document = one mapping: vanity name -> steamId
export interface IVanity{
    vanityName: string;
    steamId: string;
    createdAt: Date;
}

const vanitySchema = new Schema<IVanity>({
    vanityName: {type:String, required: true, lowercase: true, unique: true},
    steamId: {type: String, required: true},
    createdAt: {type: Date, default: Date.now, expires:"7d"}
})

const VanityName = model<IVanity>("VanityName", vanitySchema)

export default VanityName