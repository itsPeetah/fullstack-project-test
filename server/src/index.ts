import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import HelloResolver from "./schema/resolvers/hello";
import { MyGraphQLContext } from "./types/context";

const main = async () => {
    // Initialize express app
    const app = express();

    // Initialize apollo server
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver],
            validate: false,
        }),
        context: ({ req, res }): MyGraphQLContext => ({ req, res }),
    });

    // Set routes for express app
    app.get("/", (_, res) => {
        res.send("App is live!");
    });

    apollo.applyMiddleware({
        app,
        cors: false,
    });

    // Start express app
    app.listen(4000, () => console.log("Express server started on port 4000."));
};

main();
