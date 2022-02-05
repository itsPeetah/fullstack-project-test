import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, Stack } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useState } from "react";
import Layout from "../components/Layout";
import StackPost from "../components/StackPost";
import { UpdootSection } from "../components/UpdootSection";
import { POST_QUERY_SIZE } from "../constants";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const postQueryLimit = POST_QUERY_SIZE;
    const [postQueryVars, setPostQueryVars] = useState({
        limit: postQueryLimit,
        cursor: null as null | string,
    });
    const [{ data, fetching }] = usePostsQuery({
        variables: postQueryVars,
    });
    if (!fetching && !data) return <div>Could not download any posts...</div>;

    return (
        <>
            <Head>
                <title>Lireddit on localhost 3k</title>
            </Head>
            <Layout>
                <div>Hello posts:</div>
                <br />
                {fetching || !data ? (
                    <div>loading...</div>
                ) : (
                    <Stack spacing={8} mb={8}>
                        {data.posts.posts.map((p) => (
                            <Flex key={p.id} p={5} shadow="md">
                                <UpdootSection post={p} />
                                <Box flexGrow={1}>
                                    <StackPost
                                        key={p.id}
                                        title={p.title}
                                        snippet={p.textSnippet}
                                        author={p.author.username}
                                        createdAt={p.createdAt}
                                    />
                                </Box>
                            </Flex>
                        ))}
                    </Stack>
                )}
                <Flex>
                    {data?.posts.hasMore ? (
                        <Button
                            onClick={() => {
                                setPostQueryVars({
                                    limit: postQueryLimit,
                                    cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
                                });
                            }}
                            mx="auto"
                            mb="8"
                            isLoading={fetching}
                        >
                            Load more
                        </Button>
                    ) : (
                        <Box mx="auto" mb="8" fontSize={18} fontWeight="bold">
                            you reached the end of the page o.O
                        </Box>
                    )}
                </Flex>
            </Layout>
        </>
    );
};

// this page does use SSR
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
