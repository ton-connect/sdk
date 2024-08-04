import { ref, onMounted, onUnmounted } from "vue";
import { WalletsModalState } from "@tonconnect/ui";
import { useTonConnectUI } from "./useTonConnectUI";

export function useTonConnectModal() {
  const { tonConnectUI } = useTonConnectUI();
  const state = ref<WalletsModalState | null>(
    tonConnectUI.value?.modal.state || null
  );

  const updateState = (value: WalletsModalState) => {
    state.value = value;
  };

  onMounted(() => {
    if (tonConnectUI.value) {
      state.value = tonConnectUI.value.modal.state;
      tonConnectUI.value.onModalStateChange(updateState);
    }
  });

  onUnmounted(() => {
    if (tonConnectUI.value) {
      tonConnectUI.value.onModalStateChange(updateState);
    }
  });

  const open = () => {
    tonConnectUI.value?.modal.open();
  };

  const close = () => {
    tonConnectUI.value?.modal.close();
  };

  return {
    state,
    open,
    close,
  };
}
