import express, { type Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import router from './routes/health.ts';
import notFound from './middleware/notFound.ts';
import errorHandler from './middleware/errorHandler.ts';
import { connectToMongoDB, disconnectFromMongoDB } from './config/mongooseConnector.ts';


const app: Express = express();

const corsOptions = {origin: process.env.CLIENT_URL}
const PORT = process.env.PORT || 3001;

app.use(helmet())
app.use(cors(corsOptions));
app.use(morgan("dev"))
app.use(express.json())

app.use("/api", router)
app.use(notFound);
app.use(errorHandler);



try{
    await connectToMongoDB();
    app.listen(PORT, ()=>{
        console.log(`Server on ${PORT}`)
    });    
}catch(err){
    console.error("Failied to start server", err)
    process.exit(1)
}

process.on("SIGINT", async()=>{
    await disconnectFromMongoDB();
    process.exit(0)
});