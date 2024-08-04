import { ref, onMounted, onUnmounted } from "vue";
import {
  ConnectedWallet,
  Wallet,
  WalletInfoWithOpenMethod,
} from "@tonconnect/ui";
import { useTonConnectUI } from "./useTonConnectUI";

export function useTonWallet() {
  const { tonConnectUI } = useTonConnectUI();
  const wallet = ref<Wallet | (Wallet & WalletInfoWithOpenMethod) | null>(
    tonConnectUI.value?.wallet || null
  );

  const updateWallet = (value: ConnectedWallet | null) => {
    wallet.value = value;
  };

  onMounted(() => {
    if (tonConnectUI.value) {
      wallet.value = tonConnectUI.value.wallet;
      tonConnectUI.value.onStatusChange(updateWallet);
    }
  });

  onUnmounted(() => {
    if (tonConnectUI.value) {
      tonConnectUI.value.onStatusChange(updateWallet);
    }
  });

  return wallet;
}
