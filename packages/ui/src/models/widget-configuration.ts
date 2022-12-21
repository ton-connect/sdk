import { WalletsListConfiguration } from 'src/models/wallets-list-configuration';
import { Themed } from 'src/models/themed';

export type ModalSize = 'm' | 'l';

export interface WidgetConfiguration extends Partial<Themed> {
    size: ModalSize;
    wallets?: WalletsListConfiguration;
}
