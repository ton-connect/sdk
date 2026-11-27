import { Component, JSXElement } from 'solid-js';
import { Transition } from 'solid-transition-group';
import { animate } from 'src/app/utils/animate';
import { EASE_STANDARD, RESIZE_DURATION } from 'src/app/styles/motion';

const FADE_OUT_DURATION = 200;
const FADE_IN_DELAY = 100;

/**
 * Takes a leaving screen out of the layout without moving anything on it, so the next one can take
 * its place at once and the sheet starts changing size straight away. It is laid over the whole of
 * its positioned container, with padding where its edges were: its content stays where it was, and
 * so do its own absolutely placed parts, such as a back button, which stay placed against the
 * container.
 */
function freezeInPlace(el: HTMLElement): void {
    const container = el.offsetParent ?? el.parentElement;
    if (!(container instanceof HTMLElement)) {
        return;
    }

    const style = getComputedStyle(el);
    const width = container.clientWidth;
    const right = width - el.offsetLeft - el.offsetWidth;

    Object.assign(el.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: `${width}px`,
        margin: '0',
        boxSizing: 'border-box',
        paddingTop: `${el.offsetTop + parseFloat(style.paddingTop)}px`,
        paddingLeft: `${el.offsetLeft + parseFloat(style.paddingLeft)}px`,
        paddingRight: `${right + parseFloat(style.paddingRight)}px`,
        pointerEvents: 'none'
    });
}

function fadeOut(el: Element, done: () => void): void {
    if (!(el instanceof HTMLElement) || !('animate' in el)) {
        done();
        return;
    }

    // A screen replaced before it had faded in fades out from where it got to, not from full
    const from = Number(getComputedStyle(el).opacity || 1);
    // It has been replaced: for the rest of its fade nothing on it can be pressed, focused (a
    // control that has focus loses it) or found by screen readers. Browsers without `inert` still
    // get the `pointer-events: none` below.
    el.setAttribute('inert', '');
    freezeInPlace(el);
    animate(el, [{ opacity: from }, { opacity: 0 }], {
        duration: FADE_OUT_DURATION,
        easing: EASE_STANDARD,
        fill: 'forwards'
    }).finished.then(done, done);
}

function fadeIn(el: Element, done: () => void): void {
    if (!('animate' in el)) {
        done();
        return;
    }

    animate(el, [{ opacity: 0 }, { opacity: 1 }], {
        duration: RESIZE_DURATION - FADE_IN_DELAY,
        delay: FADE_IN_DELAY,
        easing: EASE_STANDARD,
        fill: 'backwards'
    }).finished.then(done, done);
}

export interface CrossfadeProps {
    /** One element at a time, such as a `Switch` of screens each with a single root. */
    children: JSXElement;
}

/**
 * Crossfades between screens of the modal as the sheet grows or shrinks to the new one: the old
 * screen fades out where it was while the new one fades in, a moment later, in its place. Only
 * opacity changes, so it stays with reduced motion too.
 */
export const Crossfade: Component<CrossfadeProps> = props => (
    <Transition onEnter={fadeIn} onExit={fadeOut}>
        {props.children}
    </Transition>
);
