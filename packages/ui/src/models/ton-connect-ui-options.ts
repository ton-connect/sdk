import { Locales } from 'src/app/i18n';
import { ButtonConfiguration } from 'src/models/button-configuration';
import { WidgetConfiguration } from 'src/models/widget-configuration';
import { Theme } from 'src/app/models/THEME';
import { Property } from 'csstype';
import Color = Property.Color;

export interface TonConnectUiOptions {
    theme?: Theme;
    accentColor?: Color;
    buttonRootId?: string | null;
    language?: Locales;
    buttonConfiguration?: Partial<ButtonConfiguration>;
    widgetConfiguration?: Partial<WidgetConfiguration>;
}
