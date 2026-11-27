import cn from 'classnames';
import { Component, createEffect, JSXElement, onCleanup, Show } from 'solid-js';
import { Transition } from 'solid-transition-group';
import clickOutsideDirective from 'src/app/directives/click-outside';
import keyPressedDirective from 'src/app/directives/key-pressed';
import androidBackHandlerDirective from 'src/app/directives/android-back-handler';
import { Styleable } from 'src/app/models/styleable';
import { isMobile } from 'src/app/hooks/isMobile';
import {
    borders,
    sheetBorders,
    CloseButtonStyled,
    ModalBackgroundStyled,
    ModalBodyStyled,
    ModalWrapperClass,
    overlayColor
} from './style';
import { sheetLayout } from 'src/app/styles/media';
import { css, useTheme } from 'solid-styled-components';
import { disableScroll, enableScroll, getWindow } from 'src/app/utils/web-api';
import { WithDataAttributes } from 'src/app/models/with-data-attributes';
import { useDataAttributes } from 'src/app/hooks/use-data-attributes';
import { animate } from 'src/app/utils/animate';
import { glassSurface } from 'src/app/styles/glass';
import { EASE_SHEET, EASE_STANDARD, RESIZE_DURATION } from 'src/app/styles/motion';

/** Square corners read as a bar, so with `borderRadius: none` the sheet meets the screen edges. */
const edgeToEdgeSheet = `
    width: 100%;
    max-width: none;
    margin: auto 0 0;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    border-left: none;
    border-right: none;
    border-bottom: none;
`;

/**
 * Where the sheet floats over the bottom of an iPhone with rounded screen corners (it reports a
 * bottom safe area, 34px), its bottom corners are 48px round, following the screen's 8px further
 * in, so the two curves run side by side. Elsewhere they keep the sheet's own radius.
 */
const concentricSheetBottom = `
    border-bottom-left-radius: max(40px, calc(env(safe-area-inset-bottom, 0px) + 14px));
    border-bottom-right-radius: max(40px, calc(env(safe-area-inset-bottom, 0px) + 14px));
`;

const prefersReducedMotion = (): boolean =>
    !!getWindow()?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const SHEET_ENTER = { duration: 500, easing: EASE_SHEET };
/**
 * Leaving, the sheet sets off gently and gathers speed, and it is off the screen while still moving
 * fast: it is sent a third further than it needs to go, so the easing's slow end passes out of
 * sight. It is gone after about 255 ms, and the dimming fades with it.
 */
const SHEET_EXIT = { duration: 440, easing: 'cubic-bezier(0.45, 0, 0.4, 1)' };
const SHEET_EXIT_OFFSET = 'translateY(calc(133% + 32px))';
// It stays faded once done, while the sheet finishes its way out of sight
const SHEET_EXIT_OVERLAY: KeyframeAnimationOptions = {
    duration: 260,
    easing: EASE_STANDARD,
    fill: 'forwards'
};
const DIALOG_ENTER = { duration: 300, easing: 'cubic-bezier(0.2, 0, 0, 1)' };
const DIALOG_EXIT = { duration: 200, easing: 'cubic-bezier(0.4, 0, 1, 1)' };
const REDUCED = { duration: 200, easing: 'linear' };

/**
 * How the sheet comes in: from below its own height on phones, settling like the Telegram sheets;
 * the centred dialog fades and settles. With reduced motion both only fade.
 */
function sheetMotion(direction: 'enter' | 'exit'): {
    keyframes: Keyframe[];
    timing: KeyframeAnimationOptions;
    overlayTiming?: KeyframeAnimationOptions;
} {
    if (prefersReducedMotion()) {
        const keyframes = [{ opacity: 0 }, { opacity: 1 }];
        return {
            keyframes: direction === 'enter' ? keyframes : keyframes.reverse(),
            timing: REDUCED
        };
    }
    const keyframes = isMobile()
        ? [{ transform: 'translateY(calc(100% + 24px))' }, { transform: 'translateY(0)' }]
        : [
              { opacity: 0, transform: 'scale(0.96)' },
              { opacity: 1, transform: 'scale(1)' }
          ];
    if (direction === 'enter') {
        return { keyframes, timing: isMobile() ? SHEET_ENTER : DIALOG_ENTER };
    }
    if (isMobile()) {
        return {
            keyframes: [{ transform: 'translateY(0)' }, { transform: SHEET_EXIT_OFFSET }],
            timing: SHEET_EXIT,
            overlayTiming: SHEET_EXIT_OVERLAY
        };
    }
    return { keyframes: keyframes.reverse(), timing: DIALOG_EXIT };
}

/**
 * Lets the sheet grow and shrink smoothly when its content changes height, between screens or
 * when a section unfolds, instead of jumping to the new size. It takes as long as the crossfade
 * between screens (`Crossfade`), so the two end together.
 */
function followContentHeight(body: HTMLElement): void {
    if (typeof ResizeObserver === 'undefined') {
        return;
    }
    let height = 0;
    let resizing: Animation | undefined;
    const observer = new ResizeObserver(() => {
        const next = body.offsetHeight;
        const sheet = body.parentElement;
        if (height && next !== height && sheet && !prefersReducedMotion()) {
            // The sheet's height is its border box: the body plus the sheet's own padding and
            // borders, such as the bottom safe area of an edge-to-edge sheet
            const style = getComputedStyle(sheet);
            const chrome =
                parseFloat(style.paddingTop) +
                parseFloat(style.paddingBottom) +
                parseFloat(style.borderTopWidth) +
                parseFloat(style.borderBottomWidth);
            // A change in the middle of another one goes on from the height the sheet has reached
            const from =
                resizing?.playState === 'running' ? parseFloat(style.height) : height + chrome;
            resizing?.cancel();
            resizing = animate(sheet, [{ height: `${from}px` }, { height: `${next + chrome}px` }], {
                duration: RESIZE_DURATION,
                easing: EASE_STANDARD
            });
        }
        height = next;
    });
    observer.observe(body);
    onCleanup(() => observer.disconnect());
}

// eslint-disable-next-line unused-imports/no-unused-vars
const clickOutside = clickOutsideDirective;
// eslint-disable-next-line unused-imports/no-unused-vars
const keyPressed = keyPressedDirective;
// eslint-disable-next-line unused-imports/no-unused-vars
const androidBackHandler = androidBackHandlerDirective;

export interface ModalProps extends Styleable, WithDataAttributes {
    children: JSXElement;
    opened: boolean;
    enableAndroidBackHandler: boolean;
    onClose: () => void;
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
                const enter = sheetMotion('enter');

                // The overlay fades by its colour, not its opacity: an ancestor with opacity
                // below 1 would become the backdrop of the glass, which would then blur nothing
                // until the fade ends.
                animate(
                    el,
                    [{ backgroundColor: 'transparent' }, { backgroundColor: overlayColor(theme) }],
                    enter.timing
                );
                animate(el.firstElementChild!, enter.keyframes, enter.timing);
            }}
            onExit={(el, done) => {
                const exit = sheetMotion('exit');
                // The page takes clicks again as soon as the modal starts leaving
                (el as HTMLElement).style.pointerEvents = 'none';

                const backgroundAnimation = animate(
                    el,
                    [{ backgroundColor: overlayColor(theme) }, { backgroundColor: 'transparent' }],
                    exit.overlayTiming ?? exit.timing
                );
                const contentAnimation = animate(
                    el.firstElementChild!,
                    exit.keyframes,
                    exit.timing
                );

                Promise.all([backgroundAnimation.finished, contentAnimation.finished]).then(done);
            }}
        >
            <Show when={props.opened}>
                <ModalBackgroundStyled
                    data-tc-modal="true"
                    data-tc-layout={isMobile() ? 'sheet' : 'dialog'}
                    {...dataAttrs}
                >
                    <div
                        class={cn(
                            ModalWrapperClass,
                            css`
                                ${glassSurface(theme)}
                                border-radius: ${borders[theme!.borderRadius]};

                                ${sheetLayout} {
                                    border-radius: ${sheetBorders[theme!.borderRadius]};
                                    ${theme!.borderRadius === 'm' ? concentricSheetBottom : ''}
                                    ${theme!.borderRadius === 'none' ? edgeToEdgeSheet : ''}
                                }
                            `
                        )}
                        role="dialog"
                        aria-modal="true"
                        use:clickOutside={() => props.onClose()}
                        use:keyPressed={() => props.onClose()}
                        use:androidBackHandler={{
                            isEnabled: props.enableAndroidBackHandler,
                            onClose: () => props.onClose()
                        }}
                    >
                        <ModalBodyStyled class={props.class} ref={followContentHeight}>
                            <CloseButtonStyled icon="close" onClick={() => props.onClose()} />
                            {props.children}
                        </ModalBodyStyled>
                    </div>
                </ModalBackgroundStyled>
            </Show>
        </Transition>
    );
};
