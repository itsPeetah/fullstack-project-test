import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { Box, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import { useDeletePostMutation } from "../generated/graphql";

interface PostButtonsProps {
    postId: number;
}

export const PostButtons: React.FC<PostButtonsProps> = ({ postId }) => {
    const [, deletePost] = useDeletePostMutation();

    return (
        <Box>
            <NextLink href="/post/edit/[id]" as={`/post/edit/${postId}`}>
                <Link>
                    <IconButton aria-label="Edit post" icon={<EditIcon />} />
                </Link>
            </NextLink>
            <IconButton
                aria-label="Delete post"
                // color="crimson"
                icon={<DeleteIcon />}
                onClick={() => {
                    deletePost({ id: postId });
                }}
            />
        </Box>
    );
};

export default PostButtons;
