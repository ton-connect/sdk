import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { useTheme } from 'solid-styled-components';

interface DisconnectIconProps {
    fill?: Property.Color;
}

export const DisconnectIcon: Component<DisconnectIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.icon.primary;

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M12.0001 4.00003H8.80012C7.11996 4.00003 6.27989 4.00003 5.63815 4.32701C5.07366 4.61463 4.61472 5.07357 4.3271 5.63806C4.00012 6.27979 4.00012 7.11987 4.00012 8.80003V15.2C4.00012 16.8802 4.00012 17.7203 4.3271 18.362C4.61472 18.9265 5.07366 19.3854 5.63815 19.6731C6.27989 20 7.11996 20 8.80012 20H12.0001"
                stroke={fill()}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
            <path
                d="M9 12H21M21 12L17 8M21 12L17 16"
                stroke={fill()}
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
};
