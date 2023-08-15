import { Component } from 'solid-js';
import {
    InfoModalStyled,
    H1Styled,
    StyledIconButton,
    InfoBlock,
    InfoBlockIconClass,
    H3Styled,
    TextStyled,
    ButtonsBlock
} from './style';
import {
    Button,
    LinkIcon,
    PersonalityIcon,
    SecurityIcon,
    SwapIcon,
    WalletIcon
} from 'src/app/components/';
import { Link } from 'src/app/components/link';
import { LINKS } from 'src/app/env/LINKS';

interface InfoModalProps {
    onBackClick: () => void;
}

export const InfoModal: Component<InfoModalProps> = props => {
    return (
        <InfoModalStyled>
            <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            <H1Styled>What is a wallet</H1Styled>

            <InfoBlock>
                <SecurityIcon class={InfoBlockIconClass} />
                <H3Styled>Secure digital assets storage</H3Styled>
                <TextStyled>
                    A wallet protects and manages your digital assets including TON, tokens and
                    collectables.
                </TextStyled>
            </InfoBlock>
            <InfoBlock>
                <PersonalityIcon class={InfoBlockIconClass} />
                <H3Styled>Control your Web3 identity</H3Styled>
                <TextStyled>
                    Manage your digital identity and access decentralized applications with ease.
                    Maintain control over your data and engage securely in the blockchain ecosystem.
                </TextStyled>
            </InfoBlock>
            <InfoBlock>
                <SwapIcon class={InfoBlockIconClass} />
                <H3Styled>Effortless crypto transactions</H3Styled>
                <TextStyled>
                    Easily send, receive, monitor your cryptocurrencies. Streamline your operations
                    with decentralized applications.
                </TextStyled>
            </InfoBlock>

            <ButtonsBlock>
                <Link href={LINKS.LEARN_MORE} blank>
                    <Button icon={<LinkIcon />} iconFloatRight>
                        Learn More
                    </Button>
                </Link>
                <Link href={LINKS.GET_A_WALLET} blank>
                    <Button icon={<WalletIcon />} iconFloatRight>
                        Get a Wallet
                    </Button>
                </Link>
            </ButtonsBlock>
        </InfoModalStyled>
    );
};
