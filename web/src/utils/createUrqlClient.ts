import { cacheExchange } from "@urql/exchange-graphcache";
import Router from "next/router";

import { dedupExchange, Exchange, fetchExchange } from "urql";
import { pipe, tap } from "wonka";
import {
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";

// URQL error handling "middleware"
const errorExchange: Exchange =
    ({ forward }) =>
    (ops$) => {
        return pipe(
            forward(ops$),
            tap(({ error }) => {
                if (error?.message.includes("user is not authenticated.")) {
                    // Replaces current route in the history rather than pushing to a new entry
                    Router.replace("/login");
                }
            })
        );
    };

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include" as const,
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
        errorExchange,
        ssrExchange,
        fetchExchange,
    ],
});
