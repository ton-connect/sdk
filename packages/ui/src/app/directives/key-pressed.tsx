import { Accessor, onCleanup } from 'solid-js';

export default function escPressed(_: Element, accessor: Accessor<() => void>): void {
    const onKeyPress = (e: Event): void | boolean => {
        if ((e as KeyboardEvent).key === 'Escape') {
            (document.activeElement as HTMLElement)?.blur();
            accessor()?.();
        }
    };
    document.body.addEventListener('keydown', onKeyPress);

    onCleanup(() => document.body.removeEventListener('keydown', onKeyPress));
}

declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            keyPressed: () => void;
        }
    }
}
