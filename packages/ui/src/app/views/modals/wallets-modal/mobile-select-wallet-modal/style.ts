import { styled } from 'solid-styled-components';
import { Button, H2 } from 'src/app/components';
import { rgba } from 'src/app/utils/css';

export const UlStyled = styled.ul`
    display: flex;
    margin: 0 auto 24px;
    width: fit-content;
    min-height: 124px;
    max-width: 100%;
    overflow: auto;
    padding: 0 24px;

    &&::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
`;

export const DefaultWallet = styled.li`
    width: 82px;
    min-width: 82px;
    height: 124px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;

    text-align: center;
    cursor: pointer;

    transition: transform 0.1s ease-in-out;

    &:hover {
        transform: scale(1.04);
    }

    &:active {
        transform: scale(0.96);
    }
`;

export const Divider = styled.div`
    width: 1px;
    margin: 0 10px;
    height: 24px;
    position: relative;
    top: 30px;

    background-color: ${props => props.theme!.colors.icon.tertiary};
`;

export const LongArrowIconContainer = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: ${props => rgba(props.theme!.colors.accent, 0.12)};
    color: ${props => props.theme!.colors.accent};

    margin-bottom: 8px;
`;

export const H2Styled = styled(H2)`
    margin-bottom: 24px;
    padding: 0 24px;
    min-height: 44px;
`;

export const ButtonStyled = styled(Button)`
    display: block;
    margin: 0 auto;
`;
