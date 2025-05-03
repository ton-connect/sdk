import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { useTheme } from 'solid-styled-components';

interface RetryIconProps {
    fill?: Property.Color;
}

export const RetryIcon: Component<RetryIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.accent;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
        >
            <g clip-path="url(#clip0_3676_1603)">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M15.5 1.25049C15.5 0.836275 15.1642 0.500488 14.75 0.500488C14.3358 0.500488 14 0.836275 14 1.25049V3.67012C12.7187 2.04487 10.7318 1.00049 8.5 1.00049C4.63401 1.00049 1.5 4.1345 1.5 8.00049C1.5 11.8665 4.63401 15.0005 8.5 15.0005C11.6844 15.0005 14.3703 12.8748 15.2199 9.96661C15.3361 9.56902 15.1079 9.15254 14.7103 9.03638C14.3127 8.92023 13.8962 9.14838 13.7801 9.54597C13.1123 11.8319 11 13.5005 8.5 13.5005C5.46243 13.5005 3 11.0381 3 8.00049C3 4.96292 5.46243 2.50049 8.5 2.50049C10.321 2.50049 11.9363 3.3855 12.9377 4.75049H10.5C10.0858 4.75049 9.75 5.08627 9.75 5.50049C9.75 5.9147 10.0858 6.25049 10.5 6.25049H14.75C15.1642 6.25049 15.5 5.9147 15.5 5.50049V1.25049Z"
                    fill={fill()}
                />
            </g>
            <defs>
                <clipPath id="clip0_3676_1603">
                    <rect
                        width="16"
                        height="16"
                        fill="white"
                        transform="translate(0.5 0.000488281)"
                    />
                </clipPath>
            </defs>
        </svg>
    );
};
