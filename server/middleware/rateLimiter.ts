import rateLimit from "express-rate-limit";

//passing options== configurations as argument

//rate limit api access
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {message: "Too many requests, try again later"}
});

//rate limit steam access. 
export const steamLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {message: "Too many requests to Steam, try again later"}
});