import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import InputField from "../components/InputField";
import Layout from "../components/Layout";
import Wrapper from "../components/Wrapper";
import { useCreatePostMutation, useMeQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";

export const CreatePost: React.FC<{}> = ({}) => {
    const [{}, createPost] = useCreatePostMutation();
    const router = useRouter();

    useIsAuth();

    return (
        <Layout>
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ title: "", text: "" }}
                    onSubmit={async (values, { setErrors }) => {
                        const { error } = await createPost({ options: values });
                        // send user to home page, where new post should now appear
                        console.log("error:", error);
                        if (!error) router.push("/");
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="title"
                                placeholder="Title..."
                                label="Title"
                            ></InputField>
                            <Box mt={4}>
                                <InputField
                                    textArea
                                    name="text"
                                    placeholder="Text..."
                                    label="Body"
                                />
                            </Box>
                            <Box w="100%" textAlign="center">
                                <Button
                                    mt={4}
                                    type="submit"
                                    color="blue.500"
                                    isLoading={isSubmitting}
                                >
                                    Create Post
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
