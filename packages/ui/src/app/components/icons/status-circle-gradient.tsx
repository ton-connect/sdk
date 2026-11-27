import { Component } from 'solid-js';
import { mixColor } from 'src/app/utils/css';

export interface StatusCircleGradientProps {
    id: string;
    color: string;
}

/**
 * The fill of a status circle: its colour lit from above, lighter at the top and a little deeper
 * at the bottom. Reference it as `url(#id)`.
 */
export const StatusCircleGradient: Component<StatusCircleGradientProps> = props => (
    <defs>
        <linearGradient id={props.id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color={mixColor(props.color, '#ffffff', 0.3)} />
            <stop offset="1" stop-color={mixColor(props.color, '#000000', 0.08)} />
        </linearGradient>
    </defs>
);
