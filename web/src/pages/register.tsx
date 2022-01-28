import { Button, Box } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import { useRegisterMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
    const router = useRouter();
    const [{}, register] = useRegisterMutation();
    return (
        <Wrapper variant="small">
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ username: "", password: "" }}
                    onSubmit={async (values, { setErrors }) => {
                        const response = await register(values); // The "values" keys map perfectly to the GraphQL mutation's parameters so we don't need to specify them
                        if (response.data?.register.errors) {
                            setErrors(
                                toErrorMap(response.data.register.errors)
                            );
                        } else if (response.data?.register.user) {
                            // it worked
                            router.push("/");
                        }

                        return response;
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="username"
                                placeholder="Username..."
                                label="Username"
                            ></InputField>
                            <Box mt={4}>
                                <InputField
                                    name="password"
                                    placeholder="Password..."
                                    label="Password"
                                    type="password"
                                />
                            </Box>
                            <Box w="100%" textAlign="center">
                                <Button
                                    mt={4}
                                    type="submit"
                                    color="blue.500"
                                    isLoading={isSubmitting}
                                >
                                    Register
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
export default withUrqlClient(createUrqlClient)(Register);
