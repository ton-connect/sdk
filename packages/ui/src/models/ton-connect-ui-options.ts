import { ButtonConfiguration } from 'src/models/button-configuration';
import { WidgetConfiguration } from 'src/models/widget-configuration';
import { Property } from 'csstype';
type Color = Property.Color;
import { Theme } from 'src/models/THEME';
import { Locales } from 'src/models/locales';

export interface TonConnectUiOptions {
    /**
     * Color theme for the UI elements.
     * @default SYSTEM theme.
     */
    theme?: Theme;

    /**
     * Accent color for the UI elements.
     * @default #31A6F5 (blue).
     */
    accentColor?: Color;

    /**
     * HTML element id to attach the wallet connect button. If not passed button won't appear.
     * @default null.
     */
    buttonRootId?: string | null;

    /**
     * Language for the phrases it the UI elements.
     * @default system
     */
    language?: Locales;

    /**
     * Configuration for the wallet connect button.
     */
    buttonConfiguration?: Partial<ButtonConfiguration>;

    /**
     * Configuration for the wallet connect modal and action modals.
     */
    widgetConfiguration?: Partial<WidgetConfiguration>;
}
