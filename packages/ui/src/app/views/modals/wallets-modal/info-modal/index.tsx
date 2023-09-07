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
    PersonalityIcon,
    SecurityIcon,
    SwapIcon,
    WalletIcon,
    ScrollContainer,
    Link
} from 'src/app/components';
import { LINKS } from 'src/app/env/LINKS';
import { Translation } from 'src/app/components/typography/Translation';

interface InfoModalProps {
    onBackClick: () => void;
}

export const InfoModal: Component<InfoModalProps> = props => {
    return (
        <InfoModalStyled data-tc-wallets-modal-info="true">
            <StyledIconButton icon="arrow" onClick={() => props.onBackClick()} />
            <H1Styled translationKey="walletModal.infoModal.whatIsAWallet">
                What is a wallet
            </H1Styled>

            <ScrollContainer>
                <InfoBlock>
                    <SecurityIcon class={InfoBlockIconClass} />
                    <H3Styled translationKey="walletModal.infoModal.secureDigitalAssets">
                        Secure digital assets storage
                    </H3Styled>
                    <TextStyled translationKey="walletModal.infoModal.walletProtects">
                        A wallet protects and manages your digital assets including TON, tokens and
                        collectables.
                    </TextStyled>
                </InfoBlock>
                <InfoBlock>
                    <PersonalityIcon class={InfoBlockIconClass} />
                    <H3Styled translationKey="walletModal.infoModal.controlIdentity">
                        Control your Web3 identity
                    </H3Styled>
                    <TextStyled translationKey="walletModal.infoModal.manageIdentity">
                        Manage your digital identity and access decentralized applications with
                        ease. Maintain control over your data and engage securely in the blockchain
                        ecosystem.
                    </TextStyled>
                </InfoBlock>
                <InfoBlock>
                    <SwapIcon class={InfoBlockIconClass} />
                    <H3Styled translationKey="walletModal.infoModal.effortlessCryptoTransactions">
                        Effortless crypto transactions
                    </H3Styled>
                    <TextStyled translationKey="walletModal.infoModal.easilySend">
                        Easily send, receive, monitor your cryptocurrencies. Streamline your
                        operations with decentralized applications.
                    </TextStyled>
                </InfoBlock>

                <ButtonsBlock>
                    <Link href={LINKS.GET_A_WALLET} blank>
                        <Button rightIcon={<WalletIcon />}>
                            <Translation translationKey="walletModal.infoModal.getAWallet">
                                Get a Wallet
                            </Translation>
                        </Button>
                    </Link>
                </ButtonsBlock>
            </ScrollContainer>
        </InfoModalStyled>
    );
};
