import { Component } from 'solid-js';
import { StyledText, WalletItemStyled } from './style';

interface WalletItemProps {
    iconUrl: string;
    name: string;
    onClick: () => void;
}

export const WalletItem: Component<WalletItemProps> = props => {
    return (
        <WalletItemStyled>
            <img src={props.iconUrl} alt="" />
            <StyledText>{props.name}</StyledText>
        </WalletItemStyled>
    );
};
