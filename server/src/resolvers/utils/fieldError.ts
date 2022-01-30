import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class FieldError {
    @Field(() => String)
    field: string;

    @Field(() => String)
    message: string;
}

export const usernameTooShortError: FieldError = {
    field: "username",
    message: "Username must be at least 3 characters long",
};
export const passwordTooShortError: FieldError = {
    field: "password",
    message: "Password must be at least 3 characters long",
};
export const usernameTakenError: FieldError = {
    field: "username",
    message: "Username already taken.",
};

export const unknownError: FieldError = {
    field: "unknown",
    message: "Something went wrong...",
};
export const usernameNotFoundError: FieldError = {
    field: "usernameOrEmail",
    message: "User not found.",
};

export const invalidPasswordError: FieldError = {
    field: "password",
    message: "Password not valid.",
};

export const invalidEmailError: FieldError = {
    field: "email",
    message: "Invalid email",
};

export const invalidUsernameError: FieldError = {
    field: "username",
    message: "Invalid username",
};

export const newPasswordTooShortError: FieldError = {
    field: "newPassword",
    message: "New password must be at least 3 characters long",
};

export const invalidTokenError: FieldError = {
    field: "token",
    message: "User no longer exists.",
};

export const expiredTokenError: FieldError = {
    field: "token",
    message: "Token has expired...",
};
