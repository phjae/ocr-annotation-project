import { ReactNode } from 'react';
import { Button, ButtonProps, IconButton } from '@mui/material';

interface Props extends Omit<ButtonProps, 'color' | 'variant'> {
    color?:
        | 'primary'
        | 'secondary'
        | 'info'
    variant?: 'text' | 'contained' | 'outlined' | 'gradient';
    size?: 'small' | 'medium' | 'large';
    circular?: boolean;
    iconOnly?: boolean;
    children?: ReactNode;
    [key: string]: any;
}

function CustomButton(props: Props) {
    const { color = 'white', variant = 'contained', size = 'small', children, iconOnly = false, ...rest } = props;

    if (iconOnly) {
        return (
            <IconButton color={color as any} {...rest}>
                {children}
            </IconButton>
        );
    }

    return (
        <Button
            {...rest}
            color={color as any}
            variant={variant === 'gradient' ? 'contained' : variant}
            size={size}
        >
            {children}
        </Button>
    );
}

export default CustomButton;
