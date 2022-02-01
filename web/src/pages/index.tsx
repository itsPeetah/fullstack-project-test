import { Box, Heading, Stack, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import Layout from "../components/Layout";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [{ data }] = usePostsQuery({
        variables: {
            limit: 10,
        },
    });

    return (
        <>
            <Head>
                <title>Lireddit on localhost 3k</title>
            </Head>
            <Layout>
                <div>Hello posts:</div>
                <br />
                {!data ? (
                    <div>loading...</div>
                ) : (
                    <Stack spacing={8} mb={8}>
                        {data.posts.map((p) => (
                            <Box
                                key={p._id}
                                p={5}
                                shadow="md"
                                border={
                                    p.authorId === 1 ? "1px solid cyan" : "none"
                                }
                            >
                                <Heading fontSize="xl">{p.title}</Heading>
                                <Text mt={4}>
                                    {p.text.slice(0, 80).trim() + "..."}
                                </Text>
                            </Box>
                        ))}
                    </Stack>
                )}
            </Layout>
        </>
    );
};

// this page does use SSR
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
