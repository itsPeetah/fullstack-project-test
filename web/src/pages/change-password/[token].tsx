import { Box, Button, Link, Text } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from "next/link";

export const ChangePassword: NextPage<{}> = () => {
    const router = useRouter();
    const [{}, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");
    console.log(router);
    return (
        <Wrapper variant="small">
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ newPassword: "" }}
                    onSubmit={async (values, { setErrors }) => {
                        const response = await changePassword({
                            token:
                                typeof router.query.token === "string"
                                    ? router.query.token
                                    : "",
                            newPassword: values.newPassword,
                        });
                        console.log(response);
                        if (response.data?.changePassword.errors) {
                            // error...
                            const errorMap = toErrorMap(
                                response.data.changePassword.errors
                            );
                            if ("token" in errorMap) {
                                // handle token error differently (no "token" field in the form)
                                setTokenError(errorMap.token);
                            }
                            setErrors(errorMap);
                        } else if (response.data?.changePassword.user) {
                            // Success!
                            router.push("/");
                        }
                        return response;
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="newPassword"
                                placeholder="New password..."
                                label="New Password:"
                                type="password"
                            ></InputField>
                            <Box w="100%" textAlign="center">
                                {tokenError && (
                                    <>
                                        <Box mt="4">
                                            <Text mb="4" color="red">
                                                {tokenError}
                                            </Text>

                                            <NextLink href="/forgot-password">
                                                <Link color="blue.500">
                                                    Click here to get a new
                                                    token.
                                                </Link>
                                            </NextLink>
                                        </Box>
                                    </>
                                )}
                                <Button
                                    mt={4}
                                    type="submit"
                                    color="blue.500"
                                    isLoading={isSubmitting}
                                >
                                    Change Password
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Wrapper>
    );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
