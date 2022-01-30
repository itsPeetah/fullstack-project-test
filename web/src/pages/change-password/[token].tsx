import { Box, Button, Text } from "@chakra-ui/react";
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

export const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
    const router = useRouter();
    const [{}, changePassword] = useChangePasswordMutation();
    const [tokenError, setTokenError] = useState("");
    return (
        <Wrapper variant="small">
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ newPassword: "" }}
                    onSubmit={async (values, { setErrors }) => {
                        const response = await changePassword({
                            token,
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
                                    <Text mt="4" color="red">
                                        {tokenError}
                                    </Text>
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

ChangePassword.getInitialProps = ({ query }) => {
    return {
        token: query.token as string,
    };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
