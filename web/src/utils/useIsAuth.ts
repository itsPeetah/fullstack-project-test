import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAuth = () => {
    const router = useRouter();
    const [{ data, fetching }] = useMeQuery();

    useEffect(() => {
        if (!fetching && !data?.me) {
            // if you're not logged in you can't post >.<
            // auto pushes you to login
            router.replace("/login?next=" + router.pathname);
        }
    }, [fetching, data, router]);
};
