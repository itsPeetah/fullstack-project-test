import { Request, Response } from "express";
import { SessionData } from "express-session";

export type MyGraphQLContext = {
    req: Request & { session: SessionData & { userId?: number } };
    res: Response;
};
