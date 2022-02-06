import { Box, IconButton, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Post, PostSnippetFragment, useDeletePostMutation } from "../generated/graphql";

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
