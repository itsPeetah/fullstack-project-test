import { MyGraphQLContext } from "src/types/context";
import {
    Arg,
    Ctx,
    Field,
    InputType,
    Mutation,
    ObjectType,
    Query,
    Resolver,
} from "type-graphql";
import User from "../entities/User";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;
}

@ObjectType()
class FieldError {
    @Field(() => String)
    field: string;

    @Field(() => String)
    message: string;
}

const usernameTooShortError: FieldError = {
    field: "username",
    message: "Username must be at least 3 characters long",
};
const passwordTooShortError: FieldError = {
    field: "password",
    message: "Password must be at least 3 characters long",
};
const usernameTakenError: FieldError = {
    field: "username",
    message: "Username already taken.",
};

const unknownError: FieldError = {
    field: "unknown",
    message: "Something went wrong...",
};

@ObjectType()
class UserResponse {
    @Field(() => User, { nullable: true })
    user?: User;
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}

@Resolver(() => User)
export default class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput)
        options: UsernamePasswordInput,
        @Ctx() { req }: MyGraphQLContext
    ): Promise<UserResponse> {
        if (options.username.length < 3)
            return { errors: [usernameTooShortError] };
        if (options.password.length < 3)
            return { errors: [passwordTooShortError] };

        const passHashed = await argon2.hash(options.password);
        try {
            const theUser = await User.create({
                username: options.username,
                password: passHashed,
            }).save();

            console.log(theUser);

            return { user: theUser, errors: [] };
        } catch (err) {
            console.log("ERROR");

            if (err.code == "23505") return { errors: [usernameTakenError] };
            else return { errors: [unknownError] };
        }
    }

    @Query(() => [User])
    async allUsers(): Promise<User[]> {
        const all = await User.find();
        return all;
    }
}
