import { Field, ObjectType } from "type-graphql";
import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export default class Post extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    _id!: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
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
}
