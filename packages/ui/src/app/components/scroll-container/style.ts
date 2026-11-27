import { styled } from 'solid-styled-components';

/**
 * Content fades out at an edge it can still scroll past, as in the iOS lists, instead of being
 * cut by a hard line or a divider.
 */
export const ScrollContainerStyled = styled.div<{
    maxHeight: string;
    fadeTop: boolean;
    fadeBottom: boolean;
}>`
    width: 100%;
    overflow-y: auto;
    max-height: ${props => props.maxHeight};

    -webkit-mask-image: ${props => edgeMask(props.fadeTop, props.fadeBottom)};
    mask-image: ${props => edgeMask(props.fadeTop, props.fadeBottom)};

    scrollbar-width: none;
    &&::-webkit-scrollbar {
        display: none;
    }

    &&::-webkit-scrollbar-track {
        background: transparent;
    }

    &&::-webkit-scrollbar-thumb {
        display: none;
    }
`;

function edgeMask(top: boolean, bottom: boolean): string {
    if (!top && !bottom) {
        return 'none';
    }
    return `linear-gradient(
        to bottom,
        ${top ? 'transparent 0, #000 16px' : '#000 0'},
        ${bottom ? '#000 calc(100% - 28px), transparent 100%' : '#000 100%'}
    )`;
}
