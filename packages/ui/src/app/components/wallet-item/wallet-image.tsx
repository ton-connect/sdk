import { Component } from 'solid-js';
import { Image } from 'src/app/components';
import { styled } from 'solid-styled-components';
import { Styleable } from 'src/app/models/styleable';

export interface WalletImageProps extends Styleable {
    src: string;
    borderRadius?: 's' | 'm';
}

const ImageContainer = styled.div<{ borderRadius: string }>`
    position: relative;

    &::after {
        content: '';
        display: block;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        border: 0.5px solid rgba(0, 0, 0, 0.08);

        border-radius: ${props => (props.borderRadius === 'm' ? '12px' : '6px')};
    }
`;

export const ImageStyled = styled(Image)<{ borderRadius: string }>`
    width: 100%;
    height: 100%;
    border-radius: ${props => (props.borderRadius === 'm' ? '12px' : '6px')};
`;

export const WalletImage: Component<WalletImageProps> = props => {
    return (
        <ImageContainer class={props.class} borderRadius={props.borderRadius || 'm'}>
            <ImageStyled src={props.src} borderRadius={props.borderRadius || 'm'} />
        </ImageContainer>
    );
};
