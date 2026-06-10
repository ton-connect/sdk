import type { JSX } from 'solid-js';

/**
 * Demo-only passthrough for `solid-transition-group`, swapped in by the
 * `widget-preview-ui-overrides` vite plugin for the @tonconnect/ui notifications list only.
 *
 * The real list keeps an exiting toast in the DOM for the duration of its exit animation,
 * so widget previews briefly show two toasts when a notification is replaced. Rendering
 * children without enter/exit transitions keeps exactly one toast visible while letting
 * the preview reuse the real `Notifications` component from @tonconnect/ui.
 */
interface TransitionPassthroughProps {
    children?: JSX.Element;
}

export function TransitionGroup(props: TransitionPassthroughProps): JSX.Element {
    return props.children as JSX.Element;
}

export function Transition(props: TransitionPassthroughProps): JSX.Element {
    return props.children as JSX.Element;
}
