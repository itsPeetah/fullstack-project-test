import { Field, Int, ObjectType } from "type-graphql";
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
export default class User extends BaseEntity {
    @Field(() => Int)
    @PrimaryGeneratedColumn()
    _id!: number;

    @CreateDateColumn()
    @Field(() => Date)
    createdAt: Date;

    @UpdateDateColumn()
    @Field(() => Date)
    updatedAt: Date;

    @Field(() => String)
    @Column({ unique: true })
    username!: string;

    @Field(() => String)
    @Column({ unique: true })
    email!: string;

    @Field(() => String)
    @Column()
    password!: string;
}
