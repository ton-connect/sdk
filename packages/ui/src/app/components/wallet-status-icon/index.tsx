import { Component, Show } from 'solid-js';
import { useTheme } from 'solid-styled-components';
import { ErrorIcon } from 'src/app/components/icons';
import { Styleable } from 'src/app/models/styleable';
import {
    BOX_SIZE,
    ErrorBadgeStyled,
    RING_INSET,
    RING_SIZE,
    ringRadius,
    WalletIconStyled,
    WalletStatusIconStyled
} from './style';

export interface WalletStatusIconProps extends Styleable {
    src: string;
    /** `waiting` runs a lit segment round the ring; `error` stops it and adds an error badge. */
    status: 'waiting' | 'error';
    /** For a round icon, such as Telegram's: the icon is cut to a circle and the ring is round. */
    round?: boolean;
}

/**
 * A wallet's icon showing where a request to that wallet stands. The ring round it has the
 * icon's shape, so it stays the same distance from the icon on every side.
 */
export const WalletStatusIcon: Component<WalletStatusIconProps> = props => {
    const theme = useTheme();
    const radius = (): number => (props.round ? RING_SIZE / 2 : ringRadius(theme.borderRadius));

    const Ring: Component<{ part: 'track' | 'segment' }> = ringProps => (
        <rect
            data-tc-status-ring={ringProps.part}
            x={RING_INSET}
            y={RING_INSET}
            width={RING_SIZE}
            height={RING_SIZE}
            rx={radius()}
            pathLength={100}
        />
    );

    return (
        <WalletStatusIconStyled status={props.status} class={props.class}>
            <svg viewBox={`0 0 ${BOX_SIZE} ${BOX_SIZE}`} aria-hidden="true">
                <Ring part="track" />
                <Show when={props.status === 'waiting'}>
                    <Ring part="segment" />
                </Show>
            </svg>
            <WalletIconStyled
                src={props.src}
                cutOut={props.status === 'error'}
                round={!!props.round}
            />
            <Show when={props.status === 'error'}>
                <ErrorBadgeStyled>
                    <ErrorIcon size="xs" />
                </ErrorBadgeStyled>
            </Show>
        </WalletStatusIconStyled>
    );
};
