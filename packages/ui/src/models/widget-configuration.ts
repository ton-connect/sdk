import { Themed } from 'src/app/models/themed';
import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';

export type ModalSize = 'm' | 'l';

export interface WidgetConfiguration extends Partial<Themed> {
    size?: ModalSize;
    wallets?: WalletsListConfiguration;
}
