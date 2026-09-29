import mongoose from 'mongoose';

export async function connectToMongoDB(){
  const uri = process.env.MONGODB_URI;
  if(!uri){
    throw new Error("MONGODB_URI is not set")
  }

  await mongoose.connect(uri, {serverSelectionTimeoutMS: 5000});
  console.log(`MongoDB connected: ${mongoose.connection.host}`)
}

export async function disconnectFromMongoDB(){
  await mongoose.connection.close()
}