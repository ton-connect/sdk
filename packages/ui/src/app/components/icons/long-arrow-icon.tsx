import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { useTheme } from 'solid-styled-components';

interface LongArrowIconProps {
    fill?: Property.Color;
}

export const LongArrowIcon: Component<LongArrowIconProps> = props => {
    const theme = useTheme();
    const fill = (): Property.Color => props.fill || theme.colors.icon.secondary;

    return (
        <svg
            width="18"
            height="17"
            viewBox="0 0 18 17"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M1.5 15.999L16.5 0.999023M16.5 0.999023V12.999M16.5 0.999023H4.5"
                stroke={fill()}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    );
};
