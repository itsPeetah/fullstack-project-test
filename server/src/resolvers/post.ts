import { isAuth } from "../middleware/isAuth";
import { MyGraphQLContext } from "src/types/context";
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import Post from "../entities/Post";
import { getConnection } from "typeorm";
import { POST_QUERY_LIMIT } from "../constants";
import Updoot from "../entities/Updoot";

@InputType()
class PostTitleAndTextInput {
    @Field(() => String)
    title!: string;

    @Field(() => String)
    text!: string;
}

@ObjectType()
class PaginatedPosts {
    @Field(() => [Post])
    posts: Post[];

    @Field(() => Boolean)
    hasMore: boolean;
}

Resolver((_of) => Post);
export default class PostResolver {
    @Query(() => Post, { nullable: true })
    async post(
        @Arg("postId", () => Int) postId: number
    ): Promise<Post | null | undefined> {
        return await Post.findOne(postId);
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null
        // could use @Info() info object to conditionally build the query
    ): Promise<PaginatedPosts> {
        // 20 -> 21
        const realLimit = Math.min(POST_QUERY_LIMIT, limit);
        const actualQueryLimit = realLimit + 1;

        // QUERY PARAMS
        const replacements: any[] = [actualQueryLimit];
        if (cursor) replacements.push(new Date(parseInt(cursor)));

        // SQL QUERY
        // json_build_object for RESHAPING THE DATA TO GIVE IT THE NESTED LEVELS GRAPHQL EXPECTS
        // Beware what you query for: only specified id, username and email fields!!! ** added dates but fields are still hardcoded!
        // "user" table must be referenced as "public.user" because it conflicts with postgres' default user table
        // also the author will always be fetched but we are most certainly always going to need it.
        const posts = await getConnection().query(
            `
            SELECT p.*,
            json_build_object(
                'id', u.id,
                'username', u.username,
                'email', u.email,
                'createdAt', u."createdAt",
                'updatedAt', u."updatedAt"
                ) author
            FROM post p INNER JOIN public.user u on u.id = p."authorId"
            ${cursor ? `WHERE p."createdAt" < $2` : ""}
            ORDER BY p."createdAt" DESC
            LIMIT $1
            `,
            replacements
        );

        return {
            posts: posts.slice(0, realLimit),
            hasMore: posts.length === actualQueryLimit,
        };
    }

    @Mutation(() => Post)
    @UseMiddleware(isAuth)
    async createPost(
        @Arg("options") options: PostTitleAndTextInput,
        @Ctx() { req }: MyGraphQLContext
    ): Promise<Post | null> {
        const thePost = await Post.create({
            ...options,
            authorId: req.session.userId,
        }).save();
        return thePost;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id", () => Int) postId: number) {
        const result = await Post.delete({ id: postId });
        const affected = result.affected && result.affected > 0;
        return affected;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async vote(
        @Arg("postId", () => Int) postId: number,
        @Arg("value", () => Int) value: number,
        @Ctx() { req }: MyGraphQLContext
    ) {
        const { userId } = req.session;
        const isUpdoot = value >= 0;
        const actualValue = isUpdoot ? 1 : -1;

        const updoot = await Updoot.findOne({ userId, postId }); // {where:{postId, userId}}
        console.log(updoot);
        // the user had previously voted on the post
        // and they are changing the value
        if (updoot && updoot.value !== actualValue) {
            await getConnection().transaction(async (transactionManager) => {
                await transactionManager.query(
                    `
                UPDATE updoot
                SET value = $1
                WHERE "postId" = $2 AND "userId" = $3;
                `,
                    [actualValue, postId, userId]
                );

                await transactionManager.query(
                    `    
                UPDATE post
                SET points = points + $1
                WHERE id = $2;
                `,
                    [actualValue * 2, postId]
                );
            });
        } else if (updoot && updoot.value === actualValue) {
            await getConnection().transaction(async (transactionManager) => {
                await transactionManager.query(
                    `
                UPDATE updoot
                SET value = $1
                WHERE "postId" = $2 AND "userId" = $3;
                `,
                    [0, postId, userId]
                );

                await transactionManager.query(
                    `    
                UPDATE post
                SET points = points - $1
                WHERE id = $2;
                `,
                    [actualValue, postId]
                );
            });
        }
        // the user had not voted on the post before
        else {
            await getConnection().transaction(async (transactionManager) => {
                await transactionManager.query(
                    `
                INSERT INTO updoot ("userId", "postId", "value")
                values ($1, $2, $3);
                `,
                    [userId, postId, actualValue]
                );

                await transactionManager.query(
                    `    
                UPDATE post
                SET points = points + $1
                WHERE id = $2;
                `,
                    [actualValue, postId]
                );
            });
        }

        return true;
    }
}
