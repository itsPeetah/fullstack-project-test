import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { PostSnippetFragment } from "../generated/graphql";
import UpdootSection from "./UpdootSection";

interface StackPostProps {
    post: PostSnippetFragment;
}

export const StackPost: React.FC<StackPostProps> = ({ post }) => (
    <Flex>
        <UpdootSection post={post} />
        <Box flexGrow={1}>
            <Flex>
                <Box mr="auto">
                    <NextLink href={`/post/[id]`} as={`/post/${post.id}`}>
                        <Link>
                            <Heading fontSize="xl">{post.title}</Heading>
                        </Link>
                    </NextLink>
                </Box>
                <Box ml="auto">
                    <Text align="right">by {post.author.username}</Text>
                </Box>
            </Flex>
            <Text fontStyle="italic" fontWeight={300}>
                posted on {new Date(parseInt(post.createdAt)).toDateString()}
            </Text>
            <Text mt={4}>{post.textSnippet + "..."}</Text>
        </Box>
    </Flex>
);

export default StackPost;
