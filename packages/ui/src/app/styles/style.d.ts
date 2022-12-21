// import original module declarations
import 'solid-styled-components';
import { THEME } from 'src/app/models/THEME';
import { ThemeColors } from 'src/app/styles/colors';

declare module 'solid-styled-components' {
    export interface DefaultTheme {
        theme: THEME;
        accentColor: string;
        colors: ThemeColors;
    }
}
