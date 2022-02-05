import { stringifyVariables } from "@urql/core";
import { cacheExchange, Resolver } from "@urql/exchange-graphcache";
import Router from "next/router";
import { dedupExchange, Exchange, fetchExchange } from "urql";
import { pipe, tap } from "wonka";
import {
    CreatePostMutation,
    LoginMutation,
    LogoutMutation,
    MeDocument,
    MeQuery,
    PostsDocument,
    PostsQuery,
    RegisterMutation,
} from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import { POST_QUERY_SIZE } from "../constants";

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

export const cursorPagination = (): Resolver => {
    return (_parent, fieldArgs, cache, info) => {
        const { parentKey: entityKey, fieldName } = info;

        const allFields = cache.inspectFields(entityKey);
        const fieldInfos = allFields.filter(
            (info) => info.fieldName === fieldName
        );
        const size = fieldInfos.length;
        if (size === 0) {
            return undefined;
        }

        const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;
        const cacheKey = cache.resolve(entityKey, fieldKey) as string;
        const inTheCache = cache.resolve(cacheKey, "posts");
        info.partial = !inTheCache; // cast as boolean

        // check if data is in the cache, return it from the cache
        let hasMore = true;
        let results: string[] = [];
        fieldInfos.forEach((fi) => {
            const key = cache.resolve(entityKey, fi.fieldKey) as string;
            const data = cache.resolve(key, "posts") as string[];
            const _hasMore = cache.resolve(key, "hasMore") as boolean;
            hasMore = hasMore && _hasMore;
            results.push(...data);
        });
        return {
            __typename: "PaginatedPosts",
            hasMore,
            posts: results,
        };
    };
};

export const createUrqlClient = (ssrExchange: any) => ({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include" as const,
    },
    exchanges: [
        dedupExchange,
        cacheExchange({
            keys: {
                PaginatedPosts: () => null, // if we had a different field as key we could have put it here
            },
            resolvers: {
                Query: {
                    posts: cursorPagination(),
                },
            },
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
                    logout: (result, _args, cache, _info) => {
                        // clear me query
                        betterUpdateQuery<LogoutMutation, MeQuery>(
                            cache,
                            { query: MeDocument },
                            result,
                            () => ({ me: null })
                        );
                    },
                    createPost: (_result, _args, cache, _info) => {
                        const allFields = cache.inspectFields("Query");
                        const fieldInfos = allFields.filter(
                            (info) => info.fieldName === "posts"
                        );
                        // invalidating the cache for each specific query
                        // the posts query is called with different arguments when loading more / paginating
                        fieldInfos.forEach((fi) => {
                            cache.invalidate(
                                "Query",
                                "posts",
                                fi.arguments || {}
                            );
                        });
                    },
                },
            },
        }),
        errorExchange,
        ssrExchange,
        fetchExchange,
    ],
});
