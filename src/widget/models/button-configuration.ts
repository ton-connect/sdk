import { Theme } from 'src/widget/models/THEME';

export type ButtonSize = 'm' | 'l';

export type ButtonAppearance = 'primary' | 'secondary' | 'flat';

export interface ButtonConfiguration {
    theme?: Theme;
    size?: ButtonSize;
    appearance?: ButtonAppearance;
}
