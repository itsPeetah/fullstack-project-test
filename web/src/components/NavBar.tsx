import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const [{ data, fetching: meFetching }] = useMeQuery();
    const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

    let body = null;

    if (meFetching) {
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
            <Box ml="auto" display="flex">
                <Box mr="4">
                    Hello {data.me.username} {":)"}
                </Box>
                <Button
                    color="inherit"
                    fontWeight="inherit"
                    variant={"link"}
                    onClick={() => logout()}
                    isLoading={logoutFetching}
                >
                    logout
                </Button>
            </Box>
        );
    }

    return (
        <Flex
            boxShadow={"lg"}
            p="4"
            backgroundColor="cyan.300"
            ml="auto"
            color="white"
            fontWeight={700}
        >
            {body}
        </Flex>
    );
};

export default NavBar;
