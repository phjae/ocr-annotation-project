import React from 'react';
import { Input, InputClasses, InputProps } from '@mui/material';

interface Props extends  Omit<InputProps, 'color' | 'variant'> {
    classes?: Partial<InputClasses>;
    defaultValue?: string;
    disabled?: boolean;
    placeholder?: string;
    autoFocus?: boolean;
    color?:
        | 'primary'
        | 'secondary'
        | 'info'
    multiline?: boolean;
    type?: InputProps['type'];
    rows?: number | string;
    value?: any;
    size?: InputProps['size'];
    inputProps?: InputProps['inputProps'];
    onChange?: (e: any) => void;
    onBlur?: (e: any) => void;
}

const CustomInput = React.forwardRef<HTMLInputElement, Props>(
    ({ color, inputProps, ...rest }: Props, ref: any): JSX.Element => <Input {...rest} color={color as any} inputRef={ref} inputProps={inputProps}/>,
);

export default CustomInput;
