import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    Button,
    Box,
} from "@chakra-ui/react";
import { Formik, Form, Field } from "formik";
import React from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";

interface registerProps {}

export const Register: React.FC<registerProps> = ({}) => {
    return (
        <Wrapper variant="small">
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ username: "", password: "" }}
                    onSubmit={(values) => console.log(values)}
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

export default Register;
