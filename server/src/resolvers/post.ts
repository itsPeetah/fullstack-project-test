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
    // This crashes everything => Moved to inline in Post class
    // @FieldResolver(() => String)
    // textSnippet(@Root() post: Post) {
    //     return post.text.slice(0, POST_TEXT_SNIPPET_LEN);
    // }

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

        console.log(posts);

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
}
