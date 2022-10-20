import { Component, JSXElement, Show } from 'solid-js';
import { Transition } from 'solid-transition-group';
import clickOutsideDirective from 'src/app/directives/click-outside';
import keyPressedDirective from 'src/app/directives/key-pressed';
import { CloseButtonStyled, ModalBackgroundStyled, ModalWrapperClass } from './style';
const clickOutside = clickOutsideDirective;
const keyPressed = keyPressedDirective;

interface ModalProps {
    children: JSXElement;
    opened: boolean;
    onClose: () => void;
}

export const Modal: Component<ModalProps> = props => {
    return (
        <Transition
            onBeforeEnter={el => {
                el.animate([{ opacity: 0 }, { opacity: 1 }], {
                    duration: 100
                });
            }}
            onExit={(el, done) => {
                const a = el.animate([{ opacity: 1 }, { opacity: 0 }], {
                    duration: 100
                });
                a.finished.then(done);
            }}
        >
            <Show when={props.opened}>
                <ModalBackgroundStyled>
                    <div
                        class={ModalWrapperClass}
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
