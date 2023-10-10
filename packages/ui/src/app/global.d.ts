import 'solid-js';
import { globalStylesTag } from 'src/app/styles/global-styles';

declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            [globalStylesTag]: JSX.HTMLAttributes<HTMLElement>;
        }
    }
}
