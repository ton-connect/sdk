import { Theme } from 'src/widget/models/THEME';
import { WalletsListConfiguration } from 'src/widget/models/wallets-list-configuration';

export type ButtonSize = 'm' | 'l';

export interface WidgetConfiguration {
    theme?: Theme;
    size?: ButtonSize;
    backgroundColor?: string;
    wallets?: WalletsListConfiguration;
}
