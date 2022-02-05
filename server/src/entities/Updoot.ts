import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import Post from "./Post";
import User from "./User";

// M to N
// MANY TO MANY RELATIONSHIP
// user 0:M <-> 0:N post
// user -> join table <- post
// user -> updoot <- post

@ObjectType()
@Entity()
export default class Updoot extends BaseEntity {
    @Field()
    @PrimaryColumn()
    userId!: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.updoots)
    user!: User;

    @Field()
    @PrimaryColumn()
    postId!: number;

    @Field(() => Post)
    @ManyToOne(() => Post, (post) => post.updoots, { onDelete: "CASCADE" })
    post!: Post;

    @Field()
    @Column({ type: "int" })
    value!: number;
}
