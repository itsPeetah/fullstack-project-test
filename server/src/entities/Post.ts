import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import User from "./User";

@ObjectType()
@Entity()
export default class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    _id!: number;

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

    @Field()
    @Column({ type: "int", default: 0 })
    points!: number;

    @Field()
    @Column({ default: 1 })
    authorId!: number;

    @ManyToOne(() => User, (user) => user.posts)
    author: User;
}
