import React from "react";
import NavBar from "./NavBar";
import Wrapper, { WrapperVariant } from "./Wrapper";

interface LayoutProps {
    wrapperVariant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    wrapperVariant = "regular",
}) => {
    return (
        <>
            <NavBar />
            <Wrapper variant={wrapperVariant}>{children}</Wrapper>
        </>
    );
};

export default Layout;
