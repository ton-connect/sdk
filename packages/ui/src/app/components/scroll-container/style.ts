import { styled } from 'solid-styled-components';
import { media } from 'src/app/styles/media';

export const ScrollContainerStyled = styled.div<{ maxHeight: string }>`
    width: 100%;
    overflow-y: auto;
    max-height: ${props => props.maxHeight};

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

export const ScrollDivider = styled.div<{ isShown: boolean }>`
    height: 1px;
    margin: 0 -24px;
    width: calc(100% + 48px);
    opacity: 0.08;
    background: ${props => (props.isShown ? props.theme!.colors.icon.secondary : 'transparent')};
    transition: background 0.15s ease-in-out;

    ${media('mobile')} {
        width: 100%;
        margin: 0;
    }
`;
