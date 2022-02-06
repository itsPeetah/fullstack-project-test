import DataLoader from "dataloader";
import { Request, Response } from "express";
import { SessionData } from "express-session";
import { Redis } from "ioredis";
import User from "src/entities/User";

export type MyGraphQLContext = {
    req: Request & { session: SessionData & { userId?: number } };
    res: Response;
    redis: Redis;
    userLoader: DataLoader<number, User>; // ReturnType<typeof createUserLoader>;
};
