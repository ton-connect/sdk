import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { useTheme } from 'solid-styled-components';

interface TonIconProps {
    fill?: Property.Color;
}

export const TonIcon: Component<TonIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.icon.primary;

    return (
        <svg
            width="16"
            height="15"
            viewBox="0 0 16 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.1839 12.7069C9.6405 13.6507 9.36881 14.1226 9.05907 14.348C8.42775 14.8074 7.57228 14.8074 6.94096 14.348C6.63122 14.1226 6.35952 13.6507 5.81613 12.7069L1.52066 5.24638C0.768635 3.94024 0.392625 3.28717 0.337617 2.75894C0.225505 1.68236 0.818944 0.655911 1.80788 0.215893C2.29309 0 3.04667 0 4.55383 0H11.4462C12.9534 0 13.7069 0 14.1922 0.215893C15.1811 0.655911 15.7745 1.68236 15.6624 2.75894C15.6074 3.28717 15.2314 3.94024 14.4794 5.24638L10.1839 12.7069ZM7.10002 11.3412L2.56139 3.48002C2.31995 3.06185 2.19924 2.85276 2.18146 2.68365C2.14523 2.33896 2.33507 2.01015 2.65169 1.86919C2.80703 1.80002 3.04847 1.80002 3.53133 1.80002H3.53134L7.10002 1.80002V11.3412ZM8.90001 11.3412L13.4387 3.48002C13.6801 3.06185 13.8008 2.85276 13.8186 2.68365C13.8548 2.33896 13.665 2.01015 13.3484 1.86919C13.193 1.80002 12.9516 1.80002 12.4687 1.80002L8.90001 1.80002V11.3412Z"
                fill={fill()}
            />
        </svg>
    );
};
