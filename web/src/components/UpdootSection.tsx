import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";

interface UpdootSectionProps {
    points: number;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ ...props }) => {
    return (
        <Flex
            ml="auto"
            direction={"column"}
            justifyContent="center"
            alignItems="center"
            mr={4}
        >
            <IconButton
                aria-label="updoot post"
                icon={<ChevronUpIcon fontSize="28px" size="24px" />}
            />
            <b>{props.points}</b>
            <IconButton
                aria-label="downdoot post"
                icon={<ChevronDownIcon fontSize="28px" size="24px" />}
            />
        </Flex>
    );
};

export default UpdootSection;
