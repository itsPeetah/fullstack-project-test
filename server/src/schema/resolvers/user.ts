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
const usernameNotFoundError: FieldError = {
    field: "username",
    message: "User not found.",
};

const invalidPasswordError: FieldError = {
    field: "password",
    message: "Password not valid.",
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
    // Queries
    @Query(() => [User])
    async allUsers(): Promise<User[]> {
        const all = await User.find();
        return all;
    }

    @Query(() => User, { nullable: true })
    async findUser(
        @Arg("username", () => String) username: string
    ): Promise<User | undefined> {
        const usr = await User.findOne({ username });
        return usr;
    }

    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: MyGraphQLContext
    ): Promise<User | null | undefined> {
        if (!req.session.userId) return null;

        const theUser = await User.findOne({ _id: req.session.userId });
        return theUser; // return theUser! if I'm sure it's going to be defined
    }

    // Mutations
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

            req.session.userId = theUser._id;
            return { user: theUser, errors: [] };
        } catch (err) {
            console.log("ERROR");

            if (err.code == "23505") return { errors: [usernameTakenError] };
            else return { errors: [unknownError] };
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("options", () => UsernamePasswordInput)
        options: UsernamePasswordInput,
        @Ctx() { req }: MyGraphQLContext
    ): Promise<UserResponse> {
        const theUser = await User.findOne({ username: options.username });
        if (!theUser) return { errors: [usernameNotFoundError] };

        const isPassValid = await argon2.verify(
            theUser.password,
            options.password
        );
        if (!isPassValid) return { errors: [invalidPasswordError] };

        req.session.userId = theUser._id;

        return { user: theUser };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyGraphQLContext) {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie("qid"); // clear cookie on client
                if (err) {
                    console.log("Error destroying the session:", err);
                    resolve(false);
                    return;
                }
                resolve(true);
            })
        );
    }
}
