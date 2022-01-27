import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import HelloResolver from "./schema/resolvers/hello";
import { MyGraphQLContext } from "./types/context";
import cors from "cors";
import User from "./schema/entities/User";
import UserResolver from "./schema/resolvers/user";

const main = async () => {
    // @ts-ignore value not used
    const orm = await createConnection({
        type: "postgres",
        database: "lireddit",
        username: "postgres",
        password: "postgres",
        logging: true,
        synchronize: true,
        entities: [User],
    });

    // Initialize express app
    const app = express();

    app.use(
        cors({
            origin: "http://localhost:4000",
            credentials: true,
        })
    );

    // Initialize apollo server
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver],
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
