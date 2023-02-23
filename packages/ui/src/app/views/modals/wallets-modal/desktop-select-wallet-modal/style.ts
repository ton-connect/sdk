import { styled } from 'solid-styled-components';
import { Button, H2 } from 'src/app/components';

export const DesktopSelectWalletModalStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const H2Styled = styled(H2)`
    margin-bottom: 26px;
`;

export const WalletsUl = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, 92px);
    justify-content: center;
    row-gap: 8px;
    overflow-y: auto;
    max-height: 410px;
    width: calc(100% + 12px);
    margin-bottom: 30px;
    padding: 10px 0;
    align-self: flex-start;

    &&::-webkit-scrollbar {
        width: 8px;
    }

    &&::-webkit-scrollbar-track {
        background: transparent;
    }

    &&::-webkit-scrollbar-thumb {
        background: #cacaca;
        border-radius: 12px;
    }
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto 1px;
    font-size: 15px;
`;
