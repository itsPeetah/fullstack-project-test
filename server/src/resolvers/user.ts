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
import {
    FieldError,
    invalidEmailError,
    usernameTooShortError,
    invalidUsernameError,
    passwordTooShortError,
    usernameTakenError,
    unknownError,
    usernameNotFoundError,
    invalidPasswordError,
} from "./utils/fieldError";
import { sendEmail } from "../utils/sendEmail";

@InputType()
class UsernamePasswordInput {
    @Field(() => String)
    email: string;

    @Field(() => String)
    username: string;

    @Field(() => String)
    password: string;
}

@ObjectType()
class UserResponse {
    @Field(() => User, { nullable: true })
    user?: User;
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[];
}

@Resolver()
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
        // Correctness checks
        if (!options.email.includes("@"))
            return { errors: [invalidEmailError] };
        if (options.username.length < 3)
            return { errors: [usernameTooShortError] };
        if (options.username.includes("@"))
            return { errors: [invalidUsernameError] };
        if (options.password.length < 3)
            return { errors: [passwordTooShortError] };

        const passHashed = await argon2.hash(options.password);
        try {
            const theUser = await User.create({
                username: options.username,
                password: passHashed,
                email: options.email,
            }).save();

            console.log(theUser);

            req.session.userId = theUser._id;

            return { user: theUser };
        } catch (err) {
            console.log("ERROR");

            if (err.code == "23505") return { errors: [usernameTakenError] };
            else return { errors: [unknownError] };
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg("usernameOrEmail", () => String) usernameOrEmail: string,
        @Arg("password", () => String) password: string,
        @Ctx() { req }: MyGraphQLContext
    ): Promise<UserResponse> {
        const theUser = await User.findOne(
            usernameOrEmail.includes("@") // of course this is totally not secure
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail }
        );
        if (!theUser) return { errors: [usernameNotFoundError] };

        const isPassValid = await argon2.verify(theUser.password, password);
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

    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg("email", () => String) email: string,
        @Ctx() { req }: MyGraphQLContext
    ) {
        const user = User.findOne({ username: email });
        if (!user) {
            // email is not in the database
            // no email is sent
            return true; // not telling the user the email doesn't exist (for security reasons)
        }

        const token = "assfgsasdafe08909"; // random string for now

        const text = `<a  href="http://localhost:3000/change-password/${token}">Reset your password</a>`;
        await sendEmail(email, "Change password", text);

        return true;
    }
}
