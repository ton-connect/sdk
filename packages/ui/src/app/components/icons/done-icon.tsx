import type { Property } from 'csstype';
import { Component } from 'solid-js';
import { useTheme } from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';

export interface DoneIconProps extends Styleable {
    fill?: Property.Color;
}

export const DoneIcon: Component<DoneIconProps> = props => {
    const theme = useTheme();
    const fill = (): string => props.fill || theme.colors.icon.secondary;

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            class={props.class}
        >
            <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M24.7803 7.21967C25.0732 7.51256 25.0732 7.98744 24.7803 8.28033L11.5303 21.5303C11.2374 21.8232 10.7626 21.8232 10.4697 21.5303L4.21967 15.2803C3.92678 14.9874 3.92678 14.5126 4.21967 14.2197C4.51256 13.9268 4.98744 13.9268 5.28033 14.2197L11 19.9393L23.7197 7.21967C24.0126 6.92678 24.4874 6.92678 24.7803 7.21967Z"
                fill={fill()}
            />
        </svg>
    );
};
