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
    newPasswordTooShortError,
    expiredTokenError,
    invalidTokenError,
} from "./utils/fieldError";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { COOKIE_NAME, FORGOT_PASSWORD_TOKEN_PREFIX } from "../constants";

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
        if (!req.session.userId) {
            console.log("NO COOKIE!");
            return null;
        }

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
        // console.log(req.session);

        return { user: theUser };
    }

    @Mutation(() => Boolean)
    logout(@Ctx() { req, res }: MyGraphQLContext) {
        return new Promise((resolve) =>
            req.session.destroy((err) => {
                res.clearCookie(COOKIE_NAME); // clear cookie on client
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
        @Ctx() { redis }: MyGraphQLContext
    ) {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("NO USER");
            // email is not in the database
            // no email is sent
            return true; // not telling the user the email doesn't exist (for security reasons)
        }

        const token = v4();
        await redis.set(
            FORGOT_PASSWORD_TOKEN_PREFIX + token,
            user._id,
            "ex",
            1000 * 60 * 60 * 34 * 3 // three days
        );

        const text = `<a  href="http://localhost:3000/change-password/${token}">Reset your password</a>`;
        await sendEmail(email, "Change password", text);

        return true;
    }

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg("token", () => String) token: string,
        @Arg("newPassword", () => String) newPassword: string,
        @Ctx() { req, redis }: MyGraphQLContext
    ): Promise<UserResponse> {
        if (newPassword.length < 3)
            return { errors: [newPasswordTooShortError] };
        const userId = await redis.get(FORGOT_PASSWORD_TOKEN_PREFIX + token);
        if (!userId) return { errors: [expiredTokenError] }; // might have been tampered with, but I won't bother checking that

        // here we know they have sent a valid token
        const user = await User.findOne(userId);
        if (!user) return { errors: [invalidTokenError] };

        const passHashed = await argon2.hash(newPassword);
        user.password = passHashed;
        user.save();

        // login our user after changing the password
        req.session.userId = parseInt(userId);

        return { user };
    }
}
