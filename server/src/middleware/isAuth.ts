import { MyGraphQLContext } from "src/types/context";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyGraphQLContext> = ({ context }, next) => {
    if (!context.req.session.userId)
        throw new Error("user is not authenticated.");

    return next();
};
