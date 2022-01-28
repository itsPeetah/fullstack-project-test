import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import HelloResolver from "./schema/resolvers/hello";
import { MyGraphQLContext } from "./types/context";
import cors from "cors";
import User from "./schema/entities/User";
import UserResolver from "./schema/resolvers/user";
import connectRedis from "connect-redis";
import session from "express-session";
import { createClient } from "redis";
import Post from "./schema/entities/Post";
import PostResolver from "./schema/resolvers/post";

const main = async () => {
    // Initialize database connection
    /*const orm = */ await createConnection({
        type: "postgres",
        database: "lireddit",
        username: "postgres",
        password: "postgres",
        logging: true,
        synchronize: true,
        entities: [User, Post],
    });

    // Initialize express app
    const app = express();

    app.use(
        cors({
            origin: "http://localhost:3000", // frontend web server address
            credentials: true,
        })
    );

    // Initialize redis for sessions
    const RedisStore = connectRedis(session);
    const redisClient = createClient();

    // Initialize session cookies
    app.use(
        session({
            name: "qid",
            store: new RedisStore({ client: redisClient, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365,
                sameSite: "lax",
                httpOnly: true,
                secure: false,
            },
            secret: "kadfgkasfkasdofkapkdpofkkadfgkasfkasdofkapkdpofk",
            resave: false,
            saveUninitialized: false,
        })
    );

    // Initialize apollo server
    const apollo = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, UserResolver, PostResolver],
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