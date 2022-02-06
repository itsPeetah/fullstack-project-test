import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, Button, Flex, IconButton, Link, Stack } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useState } from "react";
import Layout from "../components/Layout";
import StackPost from "../components/StackPost";
import NextLink from "next/link";
import { POST_QUERY_SIZE } from "../constants";
import { useDeletePostMutation, useMeQuery, usePostsQuery } from "../generated/graphql";
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

    const [{ data: meData }] = useMeQuery();

    const [, deletePost] = useDeletePostMutation();

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
                        {data.posts.posts.map(
                            (p) =>
                                p && (
                                    <Box key={p.id} p={5} shadow="md">
                                        <StackPost post={p} />
                                        <Flex>
                                            {/* Only show the edit and delete buttons for posts the user owns */}
                                            {meData?.me?.id === p.author.id && (
                                                <Box ml="auto">
                                                    <NextLink
                                                        href="/post/edit/[id]"
                                                        as={`/post/edit/${p.id}`}
                                                    >
                                                        <Link>
                                                            <IconButton
                                                                aria-label="Edit post"
                                                                icon={<EditIcon />}
                                                            />
                                                        </Link>
                                                    </NextLink>
                                                    <IconButton
                                                        aria-label="Delete post"
                                                        // color="crimson"
                                                        icon={<DeleteIcon />}
                                                        onClick={() => {
                                                            deletePost({ id: p.id });
                                                        }}
                                                    />
                                                </Box>
                                            )}
                                        </Flex>
                                    </Box>
                                )
                        )}
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
