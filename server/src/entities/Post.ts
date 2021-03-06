import { POST_TEXT_SNIPPET_LEN } from "../constants";
import { Field, Int, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import User from "./User";
import Updoot from "./Updoot";

@ObjectType()
@Entity()
export default class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    id!: number;

    @CreateDateColumn()
    @Field(() => String)
    createdAt: Date;

    @UpdateDateColumn()
    @Field(() => String)
    updatedAt: Date;

    @Column()
    @Field()
    title!: string;

    @Column()
    @Field()
    text!: string;

    // https://typegraphql.com/docs/resolvers.html#field-resolvers
    @Field(() => String)
    textSnippet(): string {
        return this.text.slice(0, POST_TEXT_SNIPPET_LEN);
    }

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field()
    @Column({ default: 1 })
    authorId!: number;

    @Field(() => User)
    @ManyToOne(() => User, (user) => user.posts)
    author: User;

    @OneToMany(() => Updoot, (updoot) => updoot.post)
    updoots: Updoot[];

    @Field(() => Int, { nullable: true })
    voteStatus: number | null;
}
