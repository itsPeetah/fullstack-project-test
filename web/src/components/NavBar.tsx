import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";
import { useRouter } from "next/router";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
    const [{ data, fetching: meFetching }] = useMeQuery({
        pause: isServer(), // Does perform the query when rendering on the server
    });

    let body = null;

    if (meFetching) {
        body = null;
    } else if (!data?.me) {
        body = (
            <Box ml="auto">
                <NextLink href="/login">
                    <Link mr="4">Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
            </Box>
        );
    } else {
        body = (
            <Flex ml="auto">
                <Box mr="4">
                    <NextLink href="/create-post">
                        <Link>New Post</Link>
                    </NextLink>
                </Box>
                <Box mr="4">|</Box>
                <Button
                    color="inherit"
                    fontWeight="inherit"
                    variant={"link"}
                    onClick={async () => {
                        await logout();
                        router.reload();
                    }}
                    isLoading={logoutFetching}
                >
                    Logout from {data.me.username}
                </Button>
            </Flex>
        );
    }

    return (
        <Flex
            boxShadow={"md"}
            p="4"
            backgroundColor="cyan.300"
            ml="auto"
            color="white"
            fontWeight={700}
            position="sticky"
            top="0"
            zIndex={10}
            userSelect="none"
        >
            <NextLink href="/">
                <Link fontWeight={800}>LiReddit but cyan</Link>
            </NextLink>
            {body}
        </Flex>
    );
};

export default NavBar;
