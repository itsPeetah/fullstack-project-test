import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import { Provider, createClient } from "urql";

const client = createClient({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
        credentials: "include",
    },
});

import theme from "../theme";

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
