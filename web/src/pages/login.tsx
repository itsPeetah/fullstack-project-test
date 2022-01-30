import { Button, Box, Link, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useLoginMutation, useRegisterMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import NextLink from "next/link";

interface loginProps {}

export const Login: React.FC<loginProps> = ({}) => {
    const router = useRouter();
    const [{}, login] = useLoginMutation();
    return (
        <Wrapper variant="small">
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ usernameOrEmail: "", password: "" }}
                    onSubmit={async (values, { setErrors }) => {
                        const response = await login(values); // The "values" keys map perfectly to the GraphQL mutation's parameters so we don't need to specify them

                        if (response.data?.login.errors) {
                            setErrors(toErrorMap(response.data.login.errors));
                        } else if (response.data?.login.user) {
                            // it worked
                            router.push("/");
                        }

                        return response;
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="usernameOrEmail"
                                placeholder="Username or email..."
                                label="Username or Email"
                            ></InputField>
                            <Box mt={4}>
                                <InputField
                                    name="password"
                                    placeholder="Password..."
                                    label="Password"
                                    type="password"
                                />
                            </Box>
                            <Flex w="100%" mt="4">
                                <Box ml="auto">
                                    <NextLink href="/forgot-password">
                                        <Link color="blue.500">
                                            Forgot password?
                                        </Link>
                                    </NextLink>
                                </Box>
                            </Flex>
                            <Box w="100%" textAlign="center">
                                <Button
                                    mt={4}
                                    type="submit"
                                    color="blue.500"
                                    isLoading={isSubmitting}
                                >
                                    Login
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Wrapper>
    );
};

// this page does not use SSR
export default withUrqlClient(createUrqlClient)(Login);
