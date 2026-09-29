import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../services/utils/HttpError.ts";

const errorHandler = (err: HttpError, req: Request, res: Response, next: NextFunction)=>{
    console.error(err);

    if (res.headersSent){
        return next(err);
    }

    const status = err.status ?? 500;
    const message = status === 500? "Internal server error" : err.message;

    res.status(status).json({message});
};

export default errorHandler;
