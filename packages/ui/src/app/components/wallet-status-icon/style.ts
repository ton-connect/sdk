import { keyframes, styled } from 'solid-styled-components';
import { rgba, toPx } from 'src/app/utils/css';
import { Image } from 'src/app/components/image';
import { BorderRadius } from 'src/models/border-radius';

export const BOX_SIZE = 92;
const ICON_SIZE = 68;
/** Clear space between the icon and the ring. */
const RING_GAP = 6;
export const RING_STROKE = 2.5;
/** Where the ring's stroke runs: its centre line, which `rect` takes as its outline. */
export const RING_INSET = (BOX_SIZE - ICON_SIZE) / 2 - RING_GAP - RING_STROKE / 2;
export const RING_SIZE = BOX_SIZE - RING_INSET * 2;

const iconRadii: Record<BorderRadius, number> = {
    m: 20,
    s: 14,
    none: 0
};

/**
 * The ring's corner radius: the icon's, grown by the distance to the ring's centre line, so the
 * ring keeps the same distance from the icon all the way round, corners included.
 */
export function ringRadius(borderRadius: BorderRadius): number {
    const radius = iconRadii[borderRadius];
    return radius === 0 ? 0 : radius + RING_GAP + RING_STROKE / 2;
}

// The badge's centre, and the hole around it cut out of the icon and the ring
const BADGE_CENTER = BOX_SIZE - 4 - 12;
const BADGE_HOLE = `radial-gradient(circle at ${BADGE_CENTER}px ${BADGE_CENTER}px, transparent 15px, #000 15.5px)`;

// The ring's length is 100 (`pathLength`), so a full lap of the segment is an offset of 100
const run = keyframes`
    to {
        stroke-dashoffset: -100;
    }
`;

/**
 * The icon in its ring. The running ring is drawn on a layer of its own (`will-change`), so Safari
 * does not redraw the glass sheet behind it on every frame, which shows as flickering tiles.
 */
export const WalletStatusIconStyled = styled.div<{ status: 'waiting' | 'error' }>`
    position: relative;
    width: ${toPx(BOX_SIZE)};
    height: ${toPx(BOX_SIZE)};
    display: flex;
    align-items: center;
    justify-content: center;

    > svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        pointer-events: none;
        will-change: transform;
        ${props =>
            props.status === 'error'
                ? `
                    -webkit-mask-image: ${BADGE_HOLE};
                    mask-image: ${BADGE_HOLE};
                `
                : `filter: drop-shadow(0 0 6px ${rgba(props.theme!.colors.connectButton.background, 0.45)});`}
    }

    [data-tc-status-ring] {
        fill: none;
        stroke-width: ${toPx(RING_STROKE)};
    }

    [data-tc-status-ring='track'] {
        stroke: ${props =>
            props.status === 'error'
                ? rgba(props.theme!.colors.icon.error, 0.75)
                : rgba(props.theme!.colors.connectButton.background, 0.16)};
    }

    /* A quarter of the ring, lit, running round it */
    [data-tc-status-ring='segment'] {
        stroke: ${props => props.theme!.colors.connectButton.background};
        stroke-linecap: round;
        stroke-dasharray: 24 76;
        animation: ${run} 1.4s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
        [data-tc-status-ring='segment'] {
            animation-duration: 4s;
        }
    }
`;

/**
 * With an error the badge sits in a hole cut out of the icon's corner, so it reads on glass of
 * any colour instead of in a ring of a fixed colour.
 */
export const WalletIconStyled = styled(Image)<{ cutOut: boolean; round: boolean }>`
    width: ${toPx(ICON_SIZE)};
    height: ${toPx(ICON_SIZE)};
    border-radius: ${props => (props.round ? '50%' : `${iconRadii[props.theme!.borderRadius]}px`)};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    ${props =>
        props.cutOut
            ? `
                -webkit-mask-image: radial-gradient(circle at 64px 64px, transparent 15px, #000 15.5px);
                mask-image: radial-gradient(circle at 64px 64px, transparent 15px, #000 15.5px);
            `
            : ''}
`;

/** Marks the wallet's icon when the wallet turned the request down or failed it. */
export const ErrorBadgeStyled = styled.div`
    position: absolute;
    right: 4px;
    bottom: 4px;
    display: flex;
`;
