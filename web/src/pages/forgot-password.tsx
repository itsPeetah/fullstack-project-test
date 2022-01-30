import { Button, Box, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
    useForgotPasswordMutation,
    useLoginMutation,
    useRegisterMutation,
} from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import NextLink from "next/link";

export const ForgotPassword: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [{}, forgotPassword] = useForgotPasswordMutation();
    const [emailSent, setEmailSent] = useState(false);

    return (
        <Wrapper variant="small">
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ email: "" }}
                    onSubmit={async (values, { setErrors }) => {
                        const response = await forgotPassword(values); // The "values" keys map perfectly to the GraphQL mutation's parameters so we don't need to specify them
                        setEmailSent(true);
                        // if (response.data?.forgotPassword.errors) {
                        //     setErrors(toErrorMap(response.data.forgotPassword.errors));
                        // } else if (response.data?.forgotPassword.user) {
                        //     // it worked
                        //     router.push("/");
                        // }

                        return response;
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="email"
                                placeholder="Email..."
                                label="Email"
                            ></InputField>
                            <Box w="100%" textAlign="center">
                                <Button
                                    mt={4}
                                    type="submit"
                                    color="blue.500"
                                    isLoading={isSubmitting}
                                >
                                    {emailSent
                                        ? "Send me another password recovery link"
                                        : "Send me a password recovery link"}
                                </Button>
                            </Box>
                            <Box w="100%" mt="4">
                                <NextLink href="/login">
                                    <Link color="blue.500">
                                        Go back to login...
                                    </Link>
                                </NextLink>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Wrapper>
    );
};

// this page does not use SSR
export default withUrqlClient(createUrqlClient)(ForgotPassword);
