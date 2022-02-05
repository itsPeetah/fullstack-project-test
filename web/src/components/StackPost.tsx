import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import React from "react";
import UpdootSection from "./UpdootSection";

interface StackPostProps {
    title: string;
    author: string;
    createdAt: string;
    snippet: string;
}

export const StackPost: React.FC<StackPostProps> = ({ ...props }) => (
    <Box>
        <Flex>
            <Box mr="auto">
                <Heading fontSize="xl">{props.title}</Heading>
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
