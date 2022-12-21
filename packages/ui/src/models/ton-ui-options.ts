import { ButtonConfiguration } from 'src/models/button-configuration';
import { WidgetConfiguration } from 'src/models/widget-configuration';
import { Themed } from 'src/models/themed';

export interface TonUiOptions extends Partial<Themed> {
    buttonConfiguration?: ButtonConfiguration;
    widgetConfiguration?: WidgetConfiguration;
}
