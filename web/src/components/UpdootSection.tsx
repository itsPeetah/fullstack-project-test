import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import { UpdootablePostFragment } from "../generated/graphql";

interface UpdootSectionProps {
    post: UpdootablePostFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    return (
        <Flex
            ml="auto"
            direction={"column"}
            justifyContent="center"
            alignItems="center"
            mr={4}
        >
            <IconButton
                aria-label="updoot post"
                icon={<ChevronUpIcon fontSize="28px" size="24px" />}
            />
            <b>{post.points}</b>
            <IconButton
                aria-label="downdoot post"
                icon={<ChevronDownIcon fontSize="28px" size="24px" />}
            />
        </Flex>
    );
};

export default UpdootSection;
