import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React, { useState } from "react";
import { UpdootablePostFragment, useVoteMutation } from "../generated/graphql";

interface UpdootSectionProps {
    post: UpdootablePostFragment;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<
        "updoot-loading" | "downdoot-loading" | "not-loading"
    >("not-loading");
    const [, vote] = useVoteMutation();

    return (
        <Flex
            ml="auto"
            direction={"column"}
            justifyContent="center"
            alignItems="center"
            mr={4}
            userSelect="none"
        >
            <IconButton
                color={post.voteStatus === 1 ? "darkOrange" : undefined}
                aria-label="updoot post"
                icon={<ChevronUpIcon fontSize="28px" size="24px" />}
                isLoading={loadingState === "updoot-loading"}
                onClick={async () => {
                    if (post.voteStatus === 1) return;
                    setLoadingState("updoot-loading");
                    await vote({ postId: post.id, value: 1 });
                    setLoadingState("not-loading");
                }}
            />
            <b>{post.points}</b>
            <IconButton
                color={post.voteStatus === -1 ? "darkCyan" : undefined}
                aria-label="downdoot post"
                icon={<ChevronDownIcon fontSize="28px" size="24px" />}
                isLoading={loadingState === "downdoot-loading"}
                onClick={async () => {
                    if (post.voteStatus === -1) return;
                    setLoadingState("downdoot-loading");
                    await vote({ postId: post.id, value: -1 });
                    setLoadingState("not-loading");
                }}
            />
        </Flex>
    );
};

export default UpdootSection;
