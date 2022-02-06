import { MyGraphQLContext } from "src/types/context";
import {
    Arg,
    Ctx,
    Field,
    FieldResolver,
    InputType,
    Int,
    Mutation,
    ObjectType,
    Query,
    Resolver,
    UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { POST_QUERY_LIMIT } from "../constants";
import Post from "../entities/Post";
import Updoot from "../entities/Updoot";
import { isAuth } from "../middleware/isAuth";

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
        // could fetch voteStatus with a complex query...maybe I'll make a field resolver for it
        return await Post.findOne(postId);
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
          ${
              req.session.userId
                  ? '(select value from updoot where "userId" = $2 and "postId" = p.id) "voteStatus"' // $2 is going to be the user's id
                  : '$2 as "voteStatus"' // $2 is going to be null -> done to be sure I always pass the replacements in the correct order
          }
          from post p
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
    @UseMiddleware(isAuth)
    async deletePost(
        @Arg("id", () => Int) postId: number,
        @Ctx() { req }: MyGraphQLContext
    ) {
        // NOT CASCADED WAY (remove onDelete: "CASCADE") from relation in Updoot
        // const post = await Post.findOne(postId)
        // if(!post) return false
        // if (post.authorId != req.session.userId) throw new Error("not authorized")
        // await Updoot.delete({postId})
        // await Post.delete({id:postId})

        const { userId } = req.session;
        const result = await Post.delete({ id: postId, authorId: userId }); // using the userId we will only allow users to delete own posts
        const affected = result.affected && result.affected > 0;
        return affected;
    }

    @Mutation(() => Post, { nullable: true })
    @UseMiddleware(isAuth)
    async updatePost(
        @Arg("id", () => Int) postId: number,
        @Arg("options") options: PostTitleAndTextInput,
        @Ctx() { req }: MyGraphQLContext
    ): Promise<Post | null> {
        const { userId } = req.session;

        const post = await Post.findOne(postId);
        if (!post) return null;

        const newTitle = options.title.length > 1 ? options.title : post.title;
        const newText = options.text.length > 1 ? options.text : post.text;

        const updateResult = await getConnection()
            .createQueryBuilder()
            .update(Post)
            .set({ title: newTitle, text: newText })
            .where('id = :id AND "authorId" = :authorId', {
                id: postId,
                authorId: userId,
            })
            .returning("*")
            .execute();

        return updateResult.raw[0] ?? null;
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
