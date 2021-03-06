import { Box, Divider, Flex, Heading, Text } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import Layout from "../../components/Layout";
import PostButtons from "../../components/PostButtons";
import UpdootSection from "../../components/UpdootSection";
import Wrapper from "../../components/Wrapper";
import { useMeQuery, usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useGetIntId } from "../../utils/useGetIntId";

interface postPageProps {}

export const PostPage: React.FC<postPageProps> = ({}) => {
    const router = useRouter();
    const postId = useGetIntId();
    const [{ data, fetching, error }] = usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId,
        },
    });

    const [{ data: meData }] = useMeQuery();

    if (fetching)
        return (
            <>
                <Head>
                    <title>LiReddit | Loading...</title>
                </Head>
                <Layout>loading...</Layout>
            </>
        );
    if (error)
        return (
            <>
                <Head>
                    <title>LiReddit | Error...</title>
                </Head>
                <Layout>
                    <Heading>Something went wrong</Heading>
                </Layout>
            </>
        );
    if (!data?.post) {
        router.push("/");
        return (
            <>
                <Head>
                    <title>LiReddit | Post...but where?</title>
                </Head>
                <Layout>
                    <Heading>Couldn't fetch the post...</Heading>
                </Layout>
            </>
        );
    }
    return (
        <>
            <Head>
                <title>{data ? data.post?.title : ""} | LiReddit</title>
            </Head>
            <Layout>
                <Wrapper>
                    <Box boxShadow={"md"} padding={8} rounded="md">
                        <Flex>
                            <Box flexGrow={1}>
                                <Text fontWeight={300} fontStyle="italic" fontSize={14}>
                                    posted on{" "}
                                    {new Date(
                                        parseInt(data.post.createdAt as string)
                                    ).toDateString()}
                                    , last updated on{" "}
                                    {new Date(
                                        parseInt(data.post.updatedAt as string)
                                    ).toDateString()}
                                </Text>
                                <Heading my={2}>{data.post.title}</Heading>
                                <Text>by {data.post.author.username}</Text>
                            </Box>
                            <Flex
                                flexDirection="column"
                                alignItems="center"
                                justifyItems={"center"}
                            >
                                <UpdootSection post={data.post} />
                                {meData?.me?.id === data.post.author.id && (
                                    <PostButtons postId={data.post.id} />
                                )}
                            </Flex>
                        </Flex>
                        <Divider my={4} borderWidth="1px" borderColor={"cyan.200"} />

                        <Text>{data?.post?.text}</Text>
                    </Box>
                </Wrapper>
            </Layout>
        </>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(PostPage);
