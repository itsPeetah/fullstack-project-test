import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import { Provider, createClient, dedupExchange, fetchExchange } from "urql";
import { cacheExchange, QueryInput, Cache } from "@urql/exchange-graphcache";
import theme from "../theme";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
} from "../generated/graphql";

function betterUpdateQuery<Result, Query>(
    cache: Cache,
    qi: QueryInput,
    result: any,
    fn: (r: Result, q: Query) => Query
) {
    return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const client = createClient({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include",
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            updates: {
                Mutation: {
                    login: (result, _args, cache, _info) => {
                        betterUpdateQuery<LoginMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            result,
                            (theResult, query) => {
                                if (theResult.login.errors) return query;
                                else return { me: theResult.login.user };
                            }
                        );
                    },

                    register: (result, _args, cache, _info) => {
                        betterUpdateQuery<RegisterMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            result,
                            (theResult, query) => {
                                if (theResult.register.errors) return query;
                                else return { me: theResult.register.user };
                            }
                        );
                    },
                    // @ts-ignore unused args
                    logout: (result, _args, cache, _info) => {
                        // clear me query
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            result,
                            () => ({ me: null })
                        );
                    },
                },
            },
        }),
        fetchExchange,
    ],
});

// @ts-ignore whatever warning these two throw
function MyApp({ Component, pageProps }) {
    return (
        <Provider value={client}>
            <ChakraProvider resetCSS theme={theme}>
                <ColorModeProvider options={{ useSystemColorMode: true }}>
                    <Component {...pageProps} />
                </ColorModeProvider>
            </ChakraProvider>
        </Provider>
    );
}

export default MyApp;
