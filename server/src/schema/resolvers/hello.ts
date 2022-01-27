import { Arg, Query, Resolver } from "type-graphql";

@Resolver()
export default class HelloResolver {
    @Query(() => String)
    hello() {
        return "hello graphql";
    }

    @Query(() => String)
    echo(@Arg("message", () => String) msg: string) {
        return msg.toUpperCase();
    }
}
