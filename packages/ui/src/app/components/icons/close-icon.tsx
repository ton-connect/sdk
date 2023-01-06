import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { useTheme } from 'solid-styled-components';

interface CloseIconProps {
    fill?: Property.Color;
}

export const CloseIcon: Component<CloseIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.icon.secondary;

    return (
        <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M0.900031 0.900397L5.00002 5.00039M5.00002 5.00039L9.10003 9.1004M5.00002 5.00039L9.10003 0.900391M5.00002 5.00039L0.900024 9.1004"
                stroke={fill()}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
};
