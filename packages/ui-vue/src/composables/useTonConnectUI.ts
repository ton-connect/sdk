import { watchEffect } from "vue";
import { TonConnectUiOptions } from "@tonconnect/ui";
import { checkProvider } from "../utils/error";
import { useTonConnectUIProvider } from "../utils/TonConnectUIProvider";

export function useTonConnectUI() {
  const { tonConnectUI, setOptions } = useTonConnectUIProvider();

  watchEffect(() => {
    if (typeof window !== "undefined") {
      checkProvider(tonConnectUI.value);
    }
  });

  const updateOptions = (options: TonConnectUiOptions) => {
    setOptions(options);
  };

  return { tonConnectUI, updateOptions };
}
