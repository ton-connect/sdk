<template>
  <div
    :id="buttonRootId"
    :class="className"
    :style="{ width: 'fit-content', ...style }"
  ></div>
</template>

<script lang="ts">
import {
  CSSProperties,
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { useTonConnectUI } from "../composables";

export default defineComponent({
  name: "TonConnectButton",
  props: {
    className: {
      type: String,
      default: "",
    },
    style: {
      type: Object as () => CSSProperties,
      default: () => ({}),
    },
  },
  setup(props) {
    const buttonRootId = "ton-connect-button";
    const { updateOptions } = useTonConnectUI();

    onMounted(() => {
      updateOptions({ buttonRootId });
    });

    onUnmounted(() => {
      updateOptions({ buttonRootId: null });
    });

    watch(
      () => props.style,
      (newStyle) => {
        // Update styles if needed when props change
        console.log(newStyle)
      }
    );

    return {
      buttonRootId,
      className: ref(props.className),
      style: ref(props.style),
    };
  },
});
</script>
