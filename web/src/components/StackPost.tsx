import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import UpdootSection from "./UpdootSection";

interface StackPostProps {
    title: string;
    author: string;
    createdAt: string;
    snippet: string;
    id: number;
}

export const StackPost: React.FC<StackPostProps> = ({ ...props }) => (
    <Box>
        <Flex>
            <Box mr="auto">
                <NextLink href={`/post/[id]`} as={`/post/${props.id}`}>
                    <Link>
                        <Heading fontSize="xl">{props.title}</Heading>
                    </Link>
                </NextLink>
            </Box>
            <Box ml="auto">
                <Text align="right">by {props.author}</Text>
            </Box>
        </Flex>
        <Text fontStyle="italic" fontWeight={300}>
            posted on {new Date(parseInt(props.createdAt)).toDateString()}
        </Text>
        <Text mt={4}>{props.snippet + "..."}</Text>
    </Box>
);

export default StackPost;
