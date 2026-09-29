import { Router, type Response, type Request } from "express";

const healthRouter = Router();

healthRouter.get("/health", (req: Request, res: Response) =>{
    res.json({status:"ok", timestamp: new Date().toISOString()});
})

export default healthRouter

