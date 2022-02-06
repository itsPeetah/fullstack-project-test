import { Button, Box, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
// import { useRouter } from "next/router";
import React, { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

export const ForgotPassword: React.FC<{}> = ({}) => {
    // const router = useRouter();
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
                                    {/*Should probably either display a link or some confirmation text to avoid eventual email spamming*/}
                                    {emailSent
                                        ? "Send me another password recovery link"
                                        : "Send me a password recovery link"}
                                </Button>
                            </Box>
                            <Box w="100%" mt="4">
                                <NextLink href="/login">
                                    <Link color="blue.500">Go back to login...</Link>
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
