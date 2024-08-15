export type { Locales } from './locales';
export { THEME } from './THEME';
export type { Theme } from './THEME';
export type {
    TonConnectUiCreateOptions,
    TonConnectUiOptionsWithManifest,
    TonConnectUiOptionsWithConnector,
    TonConnectUiCreateOptionsBase
} from './ton-connect-ui-create-options';
export type { TonConnectUiOptions } from './ton-connect-ui-options';
export type { WalletsListConfiguration } from './wallets-list-configuration';
export type { UIPreferences } from './ui-preferences';
export type { ColorsSet, PartialColorsSet } from './colors-set';
export type { BorderRadius } from './border-radius';
export type { UIWallet } from './ui-wallet';
export type { ActionConfiguration } from './action-configuration';
export type {
    ConnectedWallet,
    WalletInfoWithOpenMethod,
    WalletOpenMethod,
    WalletInfoRemoteWithOpenMethod
} from './connected-wallet';
export type { ReturnStrategy } from './return-strategy';
import type { Property } from 'csstype';
type Color = Property.Color;
export type { Color };
export type { Loadable, LoadableReady, LoadableLoading } from './loadable';
export type {
    WalletsModal,
    WalletsModalState,
    WalletModalOpened,
    WalletModalClosed,
    WalletsModalCloseReason
} from './wallets-modal';
