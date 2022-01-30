import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    textArea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({
    label,
    size: _,
    ...props
}) => {
    const [field, { error }] = useField(props);

    let FieldComponent = Input;
    // @ts-ignore
    if (props.textArea) FieldComponent = Textarea;

    return (
        <FormControl
            isInvalid={
                !!error /* error can be an empty string -> cast as boolean ('': false, 'err msg': true) */
            }
        >
            <FormLabel htmlFor={field.name}>{label}</FormLabel>
            <FieldComponent
                {...field}
                {...props}
                id={field.name}
                placeholder={props.placeholder}
            />
            {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
        </FormControl>
    );
};

export default InputField;
