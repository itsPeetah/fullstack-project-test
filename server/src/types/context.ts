import { Request, Response } from "express";
import { SessionData } from "express-session";
import { Redis } from "ioredis";

export type MyGraphQLContext = {
    req: Request & { session: SessionData & { userId?: number } };
    res: Response;
    redis: Redis;
};
