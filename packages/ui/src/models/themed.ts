import { Property } from 'csstype';
type Color = Property.Color;
import { Theme } from 'src/models/THEME';

export interface Themed {
    theme: Theme;
    accentColor: Color;
}
