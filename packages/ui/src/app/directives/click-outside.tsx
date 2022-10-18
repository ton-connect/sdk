import { Accessor, onCleanup } from 'solid-js';

export default function clickOutside(el: Element, accessor: Accessor<() => void>): void {
    const onClick = (e: Event): void | boolean => !el.contains(e.target as Node) && accessor()?.();
    document.body.addEventListener('click', onClick);

    onCleanup(() => document.body.removeEventListener('click', onClick));
}

declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            clickOutside: () => void;
        }
    }
}
