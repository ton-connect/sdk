import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { Styleable } from 'src/app/models/styleable';
import { useTheme } from 'solid-styled-components';

export interface ErrorIconProps extends Styleable {
    fill?: Property.Color;
}

export const ErrorIcon: Component<ErrorIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.icon.secondary;

    return (
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class={props.class}
        >
            <circle cx="12" cy="12" r="11" fill={fill()} />
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M7.86358 9.13637C7.51211 8.7849 7.51211 8.21505 7.86358 7.86358C8.21505 7.51211 8.7849 7.51211 9.13637 7.86358L12 10.7272L14.8636 7.86358C15.2151 7.51211 15.7849 7.51211 16.1364 7.86358C16.4878 8.21505 16.4878 8.7849 16.1364 9.13637L13.2728 12L16.1364 14.8636C16.4878 15.2151 16.4878 15.7849 16.1364 16.1364C15.7849 16.4878 15.2151 16.4878 14.8636 16.1364L12 13.2728L9.13637 16.1364C8.7849 16.4878 8.21505 16.4878 7.86358 16.1364C7.51211 15.7849 7.51211 15.2151 7.86358 14.8636L10.7272 12L7.86358 9.13637Z"
                fill="white"
            />
        </svg>
    );
};
