import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import { usePostQuery, useUpdatePostMutation } from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useGetIntId } from "../../../utils/useGetIntId";

export const EditPost: React.FC<{}> = ({}) => {
    const router = useRouter();
    const postId = useGetIntId();
    const [{ data, fetching, error }] = usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId,
        },
    });
    const [, updatePost] = useUpdatePostMutation();

    if (fetching)
        return (
            <Layout>
                <div>Loading...</div>
            </Layout>
        );
    if (error)
        return (
            <Layout>
                <div>Something went wrong...</div>
            </Layout>
        );
    if (!data?.post)
        return (
            <Layout>
                <div>Could not fetch the post...</div>
            </Layout>
        );

    return (
        <Layout>
            <Box padding={8} rounded={"16px"} boxShadow="lg">
                <Formik
                    initialValues={{ title: data.post.title, text: data.post.text }}
                    onSubmit={async (values, { setErrors }) => {
                        // The update post mutation returns a post
                        // this will update the cache automatically based on the post id
                        const { error } = await updatePost({ id: data.post!.id, options: values });

                        console.log("error:", error);
                        // send user to the post's page
                        if (!error) router.push(`/post/${data.post!.id}`);
                        // if (!error) router.back(); // takes me back to the page I was on before
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <InputField
                                name="title"
                                placeholder="Title..."
                                label="New title"
                            ></InputField>
                            <Box mt={4}>
                                <InputField
                                    textArea
                                    name="text"
                                    placeholder="Text..."
                                    label="New body"
                                />
                            </Box>
                            <Box w="100%" textAlign="center">
                                <Button
                                    mt={4}
                                    type="submit"
                                    color="blue.500"
                                    isLoading={isSubmitting}
                                >
                                    Update Post
                                </Button>
                            </Box>
                        </Form>
                    )}
                </Formik>
            </Box>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);
