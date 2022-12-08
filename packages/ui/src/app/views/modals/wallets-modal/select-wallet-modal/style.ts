import { styled } from 'solid-styled-components';
import { Button, H2 } from 'src/app/components';
import { media } from 'src/app/styles/media';

export const SelectWalletModalStyled = styled.div``;

export const UlStyled = styled.ul`
    display: flex;
    margin: 0 auto 24px;
    width: fit-content;
    max-width: 100%;
    min-height: 140px;
    overflow: auto;
    padding: 0 24px;

    &&::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;

    ${media('mobile')} {
        min-height: 126px;
    }
`;

export const H2Styled = styled(H2)`
    ${media('mobile')} {
        margin-bottom: 24px;
        padding: 0 24px;
        min-height: 44px;
    }
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;
