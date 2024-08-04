import { inject, ref, InjectionKey, Ref } from "vue";
import {
  TonConnectUI,
  TonConnectUiOptions,
  ITonConnect,
  Locales,
  ActionConfiguration,
  UIPreferences,
  WalletsListConfiguration,
  SendTransactionFeature,
  SendTransactionResponse,
  SendTransactionRequest,
} from "@tonconnect/ui";

interface TonConnectUIProviderPropsBase {
  restoreConnection?: boolean;
  language?: Locales;
  widgetRootId?: string;
  uiPreferences?: UIPreferences;
  walletsListConfiguration?: WalletsListConfiguration;
  SendTransactionFeature?: SendTransactionFeature;
  actionsConfiguration?: ActionConfiguration;
  SendTransactionResponse?: SendTransactionResponse;
  SendTransactionRequest?: SendTransactionRequest;
  enableAndroidBackHandler?: boolean;
}

interface TonConnectUIProviderPropsWithManifest
  extends TonConnectUIProviderPropsBase {
  manifestUrl: string;
}

interface TonConnectUIProviderPropsWithConnector
  extends TonConnectUIProviderPropsBase {
  connector: ITonConnect;
}

type TonConnectUIProviderProps = Partial<TonConnectUIProviderPropsBase> &
  Partial<
    | TonConnectUIProviderPropsWithManifest
    | TonConnectUIProviderPropsWithConnector
  >;

export const TonConnectUIContext: InjectionKey<Ref<TonConnectUI | null>> =
  Symbol("TonConnectUIContext");
export const TonConnectUIOptionsContext: InjectionKey<
  (options: TonConnectUiOptions) => void
> = Symbol("TonConnectUIOptionsContext");

let tonConnectUI: TonConnectUI | null = null;

export function createTonConnectUIProvider(options: TonConnectUIProviderProps) {
  const tonConnectUIRef = ref<TonConnectUI | null>(null);

  if (typeof window !== "undefined" && !tonConnectUI) {
    tonConnectUI = new TonConnectUI(options as TonConnectUiOptions);
    tonConnectUIRef.value = tonConnectUI;
  }

  const setOptions = (options: TonConnectUiOptions) => {
    if (tonConnectUI) {
      tonConnectUI.uiOptions = options;
    }
  };

  return {
    tonConnectUI: tonConnectUIRef,
    setOptions,
  };
}

export function useTonConnectUIProvider() {
  const tonConnectUI = inject(TonConnectUIContext);
  const setOptions = inject(TonConnectUIOptionsContext);

  if (!tonConnectUI || !setOptions) {
    throw new Error("TonConnectUIProvider is not properly initialized, check what you have missed in src/main.ts/.js");
  }

  return { tonConnectUI, setOptions };
}
