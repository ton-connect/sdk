import { ref, onMounted } from "vue";
import { useTonConnectUI } from "./useTonConnectUI";

export function useIsConnectionRestored() {
  const { tonConnectUI } = useTonConnectUI();
  const restored = ref(false);

  onMounted(() => {
    if (tonConnectUI.value) {
      tonConnectUI.value.connectionRestored.then(() => {
        restored.value = true;
      });
    }
  });

  return restored;
}
