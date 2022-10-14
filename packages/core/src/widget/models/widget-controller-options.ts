import { ButtonConfiguration } from 'src/widget/models/button-configuration';
import { WidgetConfiguration } from 'src/widget/models/widget-configuration';

export type ButtonSize = 'm' | 'l';

export interface WidgetControllerOptions {
    buttonConfiguration?: ButtonConfiguration;
    widgetConfiguration: WidgetConfiguration;
}
