import { styled } from 'solid-styled-components';
import { Button } from 'src/app/components';

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
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;
