import cn from 'classnames';
import { Component, createEffect, JSXElement, Show } from 'solid-js';
import { Transition } from 'solid-transition-group';
import clickOutsideDirective from 'src/app/directives/click-outside';
import keyPressedDirective from 'src/app/directives/key-pressed';
import { Styleable } from 'src/app/models/styleable';
import { isDevice, media } from 'src/app/styles/media';
import {
    borders,
    CloseButtonStyled,
    ModalBackgroundStyled,
    ModalBodyStyled,
    ModalFooterStyled,
    ModalWrapperClass,
    QuestionButtonStyled
} from './style';
import { css, useTheme } from 'solid-styled-components';
import { disableScroll, enableScroll } from 'src/app/utils/web-api';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { TonConnectBrand } from 'src/app/components';
const clickOutside = clickOutsideDirective;
const keyPressed = keyPressedDirective;

export interface ModalProps extends Styleable, WithDataAttributes {
    children: JSXElement;
    opened: boolean;
    onClose: () => void;
    onClickQuestion?: () => void;
}

export const Modal: Component<ModalProps> = props => {
    const theme = useTheme();
    const dataAttrs = useDataAttributes(props);

    createEffect(() => {
        if (props.opened) {
            disableScroll();
        } else {
            enableScroll();
        }
    });

    return (
        <Transition
            onBeforeEnter={el => {
                const duration = isDevice('mobile') ? 200 : 100;

                el.animate([{ opacity: 0 }, { opacity: 1 }], {
                    duration
                });

                if (isDevice('mobile')) {
                    el.firstElementChild!.animate(
                        [{ transform: 'translateY(390px)' }, { transform: 'translateY(0)' }],
                        {
                            duration
                        }
                    );
                }
            }}
            onExit={(el, done) => {
                const duration = isDevice('mobile') ? 200 : 100;

                const backgroundAnimation = el.animate([{ opacity: 1 }, { opacity: 0 }], {
                    duration
                });

                if (isDevice('mobile')) {
                    const contentAnimation = el.firstElementChild!.animate(
                        [{ transform: 'translateY(0)' }, { transform: 'translateY(390px)' }],
                        {
                            duration
                        }
                    );

                    Promise.all([backgroundAnimation.finished, contentAnimation.finished]).then(
                        done
                    );
                } else {
                    backgroundAnimation.finished.then(done);
                }
            }}
        >
            <Show when={props.opened}>
                <ModalBackgroundStyled data-tc-modal="true" {...dataAttrs}>
                    <div
                        class={cn(
                            ModalWrapperClass,
                            css`
                                border-radius: ${borders[theme!.borderRadius]};
                                background-color: ${theme.colors.background.secondary};
                                ${media('mobile')} {
                                    border-radius: ${borders[theme!.borderRadius]}
                                        ${borders[theme!.borderRadius]} 0 0;
                                }
                            `
                        )}
                        use:clickOutside={() => props.onClose()}
                        use:keyPressed={() => props.onClose()}
                    >
                        <ModalBodyStyled class={props.class}>
                            <CloseButtonStyled icon="close" onClick={() => props.onClose()} />
                            {props.children}
                        </ModalBodyStyled>
                        <Show when={props.onClickQuestion}>
                            <ModalFooterStyled>
                                <TonConnectBrand />
                                <QuestionButtonStyled
                                    onClick={props.onClickQuestion!}
                                    icon="question"
                                />
                            </ModalFooterStyled>
                        </Show>
                    </div>
                </ModalBackgroundStyled>
            </Show>
        </Transition>
    );
};
