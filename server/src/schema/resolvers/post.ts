import {
    Arg,
    Field,
    InputType,
    Int,
    Mutation,
    Query,
    Resolver,
} from "type-graphql";
import Post from "../entities/Post";

@InputType()
class PostTitleAndTextInput {
    @Field(() => String)
    title!: string;

    @Field(() => String)
    text!: string;
}

Resolver();
export default class PostResolver {
    @Query(() => [Post])
    async posts(): Promise<Post[]> {
        const allPosts = await Post.find();
        return allPosts;
    }

    @Mutation(() => Post)
    async createPost(
        @Arg("options") options: PostTitleAndTextInput
    ): Promise<Post> {
        const thePost = await Post.create({
            title: options.title,
            text: options.text,
        }).save();
        return thePost;
    }

    @Mutation(() => Boolean)
    async deletePost(@Arg("id", () => Int) postId: number) {
        const result = await Post.delete({ _id: postId });
        const affected = result.affected && result.affected > 0;
        return affected;
    }
}
