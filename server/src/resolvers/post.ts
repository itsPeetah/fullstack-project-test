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

Resolver(Post);
export default class PostResolver {
    @Query(() => Post, { nullable: true })
    async post(
        @Arg("id", () => Int) postId: number
    ): Promise<Post | null | undefined> {
        // {relations: [...]} -> TypeORM will authomatically do the SQL join for us :$
        // could fetch voteStatus with a complex query...maybe I'll make a field resolver for it
        return await Post.findOne(postId, { relations: ["author"] });
    }

    @Query(() => PaginatedPosts)
    async posts(
        @Arg("limit", () => Int) limit: number,
        @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
        @Ctx() { req }: MyGraphQLContext
    ): Promise<PaginatedPosts> {
        const actualLimit = Math.min(POST_QUERY_LIMIT, limit);
        const actualLimitPlusOne = actualLimit + 1;

        const replacements: any[] = [actualLimitPlusOne, req.session.userId];

        if (cursor) {
            replacements.push(new Date(parseInt(cursor)));
        }

        // SQL QUERY
        // json_build_object for RESHAPING THE DATA TO GIVE IT THE NESTED LEVELS GRAPHQL EXPECTS
        // Beware what you query for: only specified id, username and email fields!!! ** added dates but fields are still hardcoded!
        // "user" table must be referenced as "public.user" because it conflicts with postgres' default user table
        // also the author will always be fetched but we are most certainly always going to need it.
        const posts = await getConnection().query(
            `
          select p.*,
          json_build_object(
            'id', u.id,
            'username', u.username,
            'email', u.email,
            'createdAt', u."createdAt",
            'updatedAt', u."updatedAt"
            ) author,
          ${
              req.session.userId
                  ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"' // $2 is going to be the user's id
                  : '$2 as "voteStatus"' // $2 is going to be null -> done to be sure I always pass the replacements in the correct order
          }
          from post p
          inner join public.user u on u.id = p."authorId"
          ${cursor ? `where p."createdAt" < $3` : ""}
          order by p."createdAt" DESC
          limit $1
          `,
            replacements
        );

        return {
            posts: posts.slice(0, actualLimit),
            hasMore: posts.length === actualLimitPlusOne,
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
        const isUpdoot = value > 0;
        const actualValue = isUpdoot ? 1 : -1;
        const { userId } = req.session;

        const updoot = await Updoot.findOne({ userId, postId }); // {where:{postId, userId}}

        // the user has voted on the post before
        // and they are changing their vote
        if (updoot && updoot.value !== actualValue) {
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                    UPDATE updoot
                    SET value = $1
                    WHERE "postId" = $2 AND "userId" = $3
                        `,
                    [actualValue, postId, userId]
                );

                await tm.query(
                    `
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2
                    `,
                    [2 * actualValue, postId]
                );
            });
        } else if (!updoot) {
            // has never voted before
            await getConnection().transaction(async (tm) => {
                await tm.query(
                    `
                    INSERT INTO updoot ("userId", "postId", value)
                    VALUES ($1, $2, $3)
                        `,
                    [userId, postId, actualValue]
                );

                await tm.query(
                    `
                    UPDATE post
                    SET points = points + $1
                    WHERE id = $2
                    `,
                    [actualValue, postId]
                );
            });
        }
        return true;
    }
}
