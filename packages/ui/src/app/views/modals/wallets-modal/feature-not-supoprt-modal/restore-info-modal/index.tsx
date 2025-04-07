import { Component } from 'solid-js';
import {
    RestoreInfoModalStyled,
    StyledIconButton,
    H1Styled,
    StepBlock,
    H3Styled,
    TextStyled,
    CircleNumber
} from './style';
import { ScrollContainer } from 'src/app/components';

interface RestoreInfoModalProps {
    onBackClick: () => void;
}

export const RestoreInfoModal: Component<RestoreInfoModalProps> = props => {
    return (
        <RestoreInfoModalStyled data-tc-wallets-modal-restore="true">
            <StyledIconButton icon="arrow" onClick={props.onBackClick} />
            <H1Styled translationKey="walletModal.restoreInfoModal.title">Restore</H1Styled>

            <ScrollContainer>
                <StepBlock>
                    <CircleNumber>1</CircleNumber>
                    <H3Styled translationKey="walletModal.restoreModal.step1.title">
                        Find your current recovery phrase
                    </H3Styled>
                    <TextStyled translationKey="walletModal.restoreModal.step1.text">
                        Open your wallet settings and locate the&nbsp;recovery&nbsp;phrase
                    </TextStyled>
                </StepBlock>

                <StepBlock>
                    <CircleNumber>2</CircleNumber>
                    <H3Styled translationKey="walletModal.restoreModal.step2.title">
                        Copy your recovery phrase
                    </H3Styled>
                    <TextStyled translationKey="walletModal.restoreModal.step2.text">
                        Write it down or copy it to a safe place
                    </TextStyled>
                </StepBlock>

                <StepBlock>
                    <CircleNumber>3</CircleNumber>
                    <H3Styled translationKey="walletModal.restoreModal.step3.title">
                        Restore in a supported wallet from&nbsp;the&nbsp;list&nbsp;below
                    </H3Styled>
                    <TextStyled translationKey="walletModal.restoreModal.step3.text">
                        Enter the recovery phrase to access your wallet
                    </TextStyled>
                </StepBlock>
            </ScrollContainer>
        </RestoreInfoModalStyled>
    );
};
