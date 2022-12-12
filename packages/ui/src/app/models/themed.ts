import { Theme } from 'src/app/models/THEME';
import { Property } from 'csstype';
import Color = Property.Color;

export interface Themed {
    theme: Theme;
    accentColor: Color;
}
