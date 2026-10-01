import express, { type Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import healthRouter from './routes/healthRouter.ts';
import userRouter from './routes/usersRouter.ts';

import notFound from './middleware/notFound.ts';
import errorHandler from './middleware/errorHandler.ts';
import { apiLimiter, steamLimiter } from './middleware/rateLimiter.ts';

import { connectToMongoDB, disconnectFromMongoDB } from './config/mongooseConnector.ts';


const app: Express = express();

const corsOptions = {origin: process.env.CLIENT_URL}
const PORT = process.env.PORT || 3001;

//middleware
app.use(helmet())
app.use(cors(corsOptions));
app.use(morgan("dev"))
app.use(express.json())

//routes
app.use("/api", healthRouter)
app.use("/api", apiLimiter)
app.use("/api/users", steamLimiter, userRouter)

//helpers
app.use(notFound);
app.use(errorHandler);


//mongodb connect block
try{
    await connectToMongoDB();
    app.listen(PORT, ()=>{
        console.log(`Server on http://localhost:${PORT}/api`)
    });    
}catch(err){
    console.error("Failied to start server", err)
    process.exit(1)
}

process.on("SIGINT", async()=>{
    await disconnectFromMongoDB();
    process.exit(0)
});