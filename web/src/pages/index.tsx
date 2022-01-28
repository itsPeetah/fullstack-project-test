import { withUrqlClient } from "next-urql";
import NavBar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
    const [{ data }] = usePostsQuery();

    return (
        <>
            <NavBar />
            <div>Hello world</div>
            <br />
            {!data ? (
                <div>loading...</div>
            ) : (
                data.posts.map((p) => (
                    <div key={p._id}>
                        <h2>{p.title}</h2>
                        <p>{p.text}</p>
                    </div>
                ))
            )}
        </>
    );
};

// this page does use SSR
export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
