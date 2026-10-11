import { css, styled } from 'solid-styled-components';

export const DiamondStyled = styled.div`
    position: relative;
    flex-shrink: 0;
`;

export const DiamondStillStyled = styled.img`
    display: block;
    width: 100%;
    height: 100%;
`;

/** Stands in for the model until its first frame, then fades out over it. */
export const DiamondCoverStyled = styled.img`
    pointer-events: none;

    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
`;

/** Where the renderer puts its canvas, which it moves from one diamond to the next. */
export const DiamondSlotStyled = styled.div`
    width: 100%;
    height: 100%;
`;

// The transition lasts `HOVER_TRANSITION_DURATION` from `renderer.ts`
export const diamondCanvasClass = css`
    touch-action: none;
    cursor: pointer;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;

    display: block;

    transition: transform 0.2s ease-out;
`;
