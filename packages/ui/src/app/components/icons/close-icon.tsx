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
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M3.90003 3.89991L8.00002 7.9999M8.00002 7.9999L12.1 12.0999M8.00002 7.9999L12.1 3.8999M8.00002 7.9999L3.90002 12.0999"
                stroke={fill()}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
};
