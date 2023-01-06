import cn from 'classnames';
import { Component, JSXElement, Show } from 'solid-js';
import { Transition } from 'solid-transition-group';
import clickOutsideDirective from 'src/app/directives/click-outside';
import keyPressedDirective from 'src/app/directives/key-pressed';
import { Styleable } from 'src/app/models/styleable';
import { isDevice } from 'src/app/styles/media';
import { CloseButtonStyled, ModalBackgroundStyled, ModalWrapperClass } from './style';
import { css, useTheme } from 'solid-styled-components';
const clickOutside = clickOutsideDirective;
const keyPressed = keyPressedDirective;

export interface ModalProps extends Styleable {
    children: JSXElement;
    opened: boolean;
    onClose: () => void;
}

export const Modal: Component<ModalProps> = props => {
    const theme = useTheme();
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
                <ModalBackgroundStyled>
                    <div
                        class={cn(
                            ModalWrapperClass,
                            props.class,
                            css`
                                background-color: ${theme.colors.background.primary};
                            `
                        )}
                        use:clickOutside={() => props.onClose()}
                        use:keyPressed={() => props.onClose()}
                    >
                        <CloseButtonStyled icon="close" onClick={() => props.onClose()} />
                        {props.children}
                    </div>
                </ModalBackgroundStyled>
            </Show>
        </Transition>
    );
};
