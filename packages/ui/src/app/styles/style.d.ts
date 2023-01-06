// import original module declarations
import 'solid-styled-components';
import { THEME } from 'src/app/models/THEME';
import { ColorsSet } from 'src/app/styles/default-colors';
import { BorderRadius } from 'src/models/border-radius';

declare module 'solid-styled-components' {
    export interface DefaultTheme {
        theme: THEME;

        colors: ColorsSet;

        borderRadius: BorderRadius;
    }
}
