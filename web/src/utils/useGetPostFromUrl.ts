import { useRouter } from "next/router";
import { usePostQuery } from "../generated/graphql";

export const useGetPostFromUrl = () => {
    const router = useRouter();
    const intPostId = typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
    return usePostQuery({
        pause: intPostId === -1,
        variables: {
            id: intPostId,
        },
    });
};
