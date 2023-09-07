import { styled } from 'solid-styled-components';
import { ErrorIcon, H1, IconButton, LoaderIcon, Image, H2 } from 'src/app/components';
import { Link } from 'src/app/components/link';
import { rgba } from 'src/app/utils/css';

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

export const H1Styled = styled(H1)`
    max-width: 262px;
    margin: 0 auto 8px;
`;

export const StyledIconButton = styled(IconButton)`
    position: absolute;
    top: 16px;
    left: 16px;
`;

export const FooterStyled = styled.div`
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-top: 0.5px solid ${props => rgba(props.theme!.colors.icon.secondary, 0.2)};
`;

export const ImageStyled = styled(Image)`
    width: 36px;
    height: 36px;
    border-radius: 10px;
`;

export const FooterButton = styled(Link)`
    margin-left: auto;
`;

export const LoaderStyled = styled(LoaderIcon)`
    margin-bottom: 18px;
    margin-top: 2px;
`;

export const ErrorIconStyled = styled(ErrorIcon)`
    margin-bottom: 16px;
`;

export const BodyTextStyled = styled(H2)`
    color: ${props => props.theme!.colors.text.secondary};
    text-align: center;
    margin-bottom: 20px;
`;

export const ButtonsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    gap: 8px;
    padding-bottom: 16px;
`;
