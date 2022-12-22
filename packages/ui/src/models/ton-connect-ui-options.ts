import { ButtonConfiguration } from 'src/models/button-configuration';
import { WidgetConfiguration } from 'src/models/widget-configuration';
import { Property } from 'csstype';
type Color = Property.Color;
import { Theme } from 'src/models/THEME';
import { Locales } from 'src/models/locales';

export interface TonConnectUiOptions {
    theme?: Theme;
    accentColor?: Color;
    buttonRootId?: string | null;
    language?: Locales;
    buttonConfiguration?: Partial<ButtonConfiguration>;
    widgetConfiguration?: Partial<WidgetConfiguration>;
}
