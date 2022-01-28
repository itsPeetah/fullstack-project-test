import { ChakraProvider, ColorModeProvider } from "@chakra-ui/react";
import theme from "../theme";

// @ts-ignore whatever warning these two throw
function MyApp({ Component, pageProps }) {
    return (
        <ChakraProvider resetCSS theme={theme}>
            <ColorModeProvider options={{ useSystemColorMode: true }}>
                <Component {...pageProps} />
            </ColorModeProvider>
        </ChakraProvider>
    );
}

export default MyApp;
