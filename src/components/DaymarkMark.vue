<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    size?: number | string;
  }>(),
  {
    size: 24,
  },
);

const markSize = computed(() =>
  typeof props.size === "number" ? `${props.size}px` : props.size,
);
</script>

<template>
  <svg
    class="daymark-mark"
    :style="{ width: markSize, height: markSize }"
    viewBox="0 0 28 28"
    aria-hidden="true"
    focusable="false"
  >
    <rect
      x="3"
      y="5"
      width="22"
      height="20"
      rx="5"
      fill="#fffdf8"
      stroke="#253028"
      stroke-width="1.2"
    />
    <path
      d="M3.5 10h21M8 3v4M20 3v4"
      fill="none"
      stroke="#253028"
      stroke-linecap="round"
      stroke-width="1.2"
    />
    <rect x="7" y="12" width="4" height="3" rx="0.9" fill="#e26e4e" />
    <rect x="12" y="12" width="4" height="3" rx="0.9" fill="#e2a464" />
    <rect x="17" y="12" width="4" height="3" rx="0.9" fill="#e2a464" />
    <rect x="7" y="16" width="4" height="3" rx="0.9" fill="#e26e4e" />
    <rect x="12" y="16" width="4" height="3" rx="0.9" fill="#698a77" />
    <rect x="17" y="16" width="4" height="3" rx="0.9" fill="#698a77" />
    <rect x="7" y="20" width="4" height="3" rx="0.9" fill="#e26e4e" />
    <rect x="17" y="20" width="4" height="3" rx="0.9" fill="#698a77" />
    <rect x="12" y="20" width="4" height="3" rx="0.9" fill="#8e6a96" />
  </svg>
</template>
