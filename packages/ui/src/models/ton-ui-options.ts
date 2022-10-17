import { Themed } from 'src/app/models/themed';
import { ButtonConfiguration } from 'src/models/button-configuration';
import { WidgetConfiguration } from 'src/models/widget-configuration';

export interface TonUiOptions extends Partial<Themed> {
    buttonConfiguration?: ButtonConfiguration;
    widgetConfiguration?: WidgetConfiguration;
}
