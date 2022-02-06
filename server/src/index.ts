import "reflect-metadata";
import "dotenv-safe/config"
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import HelloResolver from "./resolvers/hello";
import { MyGraphQLContext } from "./types/context";
import cors from "cors";
import User from "./entities/User";
import UserResolver from "./resolvers/user";
import connectRedis from "connect-redis";
import session from "express-session";
import Redis from "ioredis";
import Post from "./entities/Post";
import PostResolver from "./resolvers/post";
import { COOKIE_NAME, __prod__ } from "./constants";
import path from "path";
import Updoot from "./entities/Updoot";
import { createUserLoader } from "./utils/createUserLoader";

const main = async () => {
    // Initialize database connection
    const _orm = await createConnection({
        type: "postgres",
        url:process.env.DATABASE_URL,
        logging: true,
        synchronize: !__prod__,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [User, Post, Updoot],
    });
    await _orm.runMigrations();

    // Post.delete({});

    // Initialize express app
    const app = express();

    app.use(
        cors({
            origin: process.env.CORS_ORIGIN, // frontend web server address
            credentials: true,
        })
    );

    // Initialize redis for sessions
    const RedisStore = connectRedis(session);
    const redis = new Redis(process.env.REDIS_URL); // default options

    // Initialize session cookies
    app.set("proxy", 1) // we'll have NGINX in front of the server 
    app.use(
        session({
            name: COOKIE_NAME,
            store: new RedisStore({ client: redis, disableTouch: true }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365,
                sameSite: "lax",
                httpOnly: true,
                secure: __prod__,
                // domain: __prod__ ? ".codeponder.com" : undefined
            },
            secret: process.env.SESSION_SECRET,
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
        context: ({ req, res }): MyGraphQLContext => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
        }),
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
    app.listen(parseInt(process.env.PORT), () => console.log("Express server started on port 4000."));
};

main();
