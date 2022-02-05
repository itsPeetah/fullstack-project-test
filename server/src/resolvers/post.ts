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
    ): Promise<PaginatedPosts> {
        // 20 -> 21
        const realLimit = Math.min(POST_QUERY_LIMIT, limit);
        const actualQueryLimit = realLimit + 1;

        const replacements: any[] = [actualQueryLimit];
        if (cursor) replacements.push(new Date(parseInt(cursor)));

        // "user" table must be referenced as "public.user" because it conflicts with postgres' default user table
        const posts = await getConnection().query(
            `
            SELECT p.*, u.username
            FROM post p INNER JOIN public.user u on u.id = p."authorId"
            ${cursor ? `WHERE p."createdAt" < $2` : ""}
            ORDER BY p."createdAt" DESC
            LIMIT $1
            `,
            replacements
        );

        // SORTING BY NEW
        // const qb = getConnection()
        //     .getRepository(Post)
        //     .createQueryBuilder("p")
        //     .innerJoinAndSelect("p.author", "u", 'u.id = "p.authorId"')
        //     .orderBy('p."createdAt"', "DESC") // note the quotes. column name requires "" for postgres, '' used to wrap them into a string
        //     .take(actualQueryLimit); // take(..) better than limit(..) for pagination (from typeorm docs)
        // if (cursor)
        //     qb.where('p."createdAt" < :cursor', {
        //         cursor: new Date(parseInt(cursor)),
        //     }); // add where if cursor has been passed

        // const qRes = await qb.getMany();
        const qRes = posts;

        console.log(qRes);

        return {
            posts: qRes.slice(0, realLimit),
            hasMore: qRes.length === actualQueryLimit,
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
