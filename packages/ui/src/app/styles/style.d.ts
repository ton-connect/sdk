// import original module declarations
import 'solid-styled-components';
import { THEME } from 'src/app/models/THEME';

// and extend them!
declare module 'solid-styled-components' {
    export interface DefaultTheme {
        theme: THEME;
        accentColor: string;
    }
}
