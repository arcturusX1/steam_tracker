import type { Request, Response, NextFunction } from "express";

interface HttpError extends Error{
    status?: number;
}

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
