import { chip } from 'src/app/styles/chip';
import { sheetLayout } from 'src/app/styles/media';
import { sheetHeaderTitle, sheetIconButton } from 'src/app/components/icon-button/style';
import { styled } from 'solid-styled-components';
import { H1, IconButton, Image, H2, WalletStatusIcon } from 'src/app/components';
import { Link } from 'src/app/components/link';
import { BorderRadiusConfig } from 'src/app/models/border-radius-config';

/** Concentric with the sheet's corners: its radius minus the 16px inset. */
const footerBorders: BorderRadiusConfig = {
    m: '20px',
    s: '12px',
    none: '0'
};

export const MobileConnectionModalStyled = styled.div``;

export const BodyStyled = styled.div`
    flex: 1;
    margin-top: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 232px;
`;

/** The waiting or the failed state in the body, centred in it as the body centres its content. */
export const StatusStyled = styled.div`
    align-self: stretch;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

export const H1Styled = styled(H1)`
    max-width: 262px;
    margin: 0 auto 8px;

    ${sheetLayout} {
        max-width: none;
        ${sheetHeaderTitle}
    }
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;

    ${sheetLayout} {
        ${sheetIconButton}
    }
`;

/**
 * The wallet's store banner, a card in the manner of the TON site's panels. In the sheet it sits
 * 24px above the bottom edge: the sheet's rounded corners make an even 16px look smaller there
 * than at the sides.
 */
export const FooterStyled = styled.div`
    margin: 0 16px;
    padding: 12px 12px 12px 14px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: ${props => footerBorders[props.theme!.borderRadius]};
    ${props => chip(props.theme!)}

    ${sheetLayout} {
        margin-bottom: 8px;
    }
`;

export const ImageStyled = styled(Image)`
    width: 40px;
    height: 40px;
    border-radius: 11px;
`;

export const FooterButton = styled(Link)`
    margin-left: auto;
`;

export const WalletStatusIconStyled = styled(WalletStatusIcon)`
    margin-bottom: 18px;
`;

/** Kept 24px clear of the sheet's sides, so long error messages do not run edge to edge. */
export const BodyTextStyled = styled(H2)`
    color: ${props => props.theme!.colors.text.secondary};
    text-align: center;
    margin-bottom: 20px;
    padding: 0 24px;
`;

/** What went wrong, read before anything else on the screen after an error. */
export const StatusTextStyled = styled(BodyTextStyled)`
    color: ${props => props.theme!.colors.text.primary};
    font-size: 17px;
    font-weight: 600;
    line-height: 22px;
`;

/** As far from the store banner below as the text above sits from the buttons. */
export const ButtonsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-bottom: 24px;
`;
