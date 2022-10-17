import { Themed } from 'src/app/models/themed';

export type ButtonSize = 'm' | 'l';

export type ButtonAppearance = 'primary' | 'secondary' | 'flat';

export interface ButtonConfiguration extends Partial<Themed> {
    size?: ButtonSize;
    appearance?: ButtonAppearance;
}
