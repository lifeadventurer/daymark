<script setup lang="ts">
import { computed } from "vue";
import { generateOrientations } from "../engine/geometry";
import type { PieceDefinition } from "../engine/types";

const props = defineProps<{
  piece: PieceDefinition;
  label: string;
  color: string;
  selected: boolean;
  placed: boolean;
  canPlace: boolean;
  orientationIndex: number;
}>();

const emit = defineEmits<{ select: []; "drag-start": [event: PointerEvent] }>();
const orientation = computed(
  () => generateOrientations(props.piece)[props.orientationIndex] ?? [],
);
const isDisabled = computed(() => props.piece.enabled === false);
const centeredOrientation = computed(() => {
  const maxX = Math.max(...orientation.value.map((cell) => cell.x), 0);
  const maxY = Math.max(...orientation.value.map((cell) => cell.y), 0);
  const offsetX = (5 - (maxX + 1)) / 2;
  const offsetY = (5 - (maxY + 1)) / 2;

  return orientation.value.map((cell) => ({
    x: cell.x + offsetX,
    y: cell.y + offsetY,
  }));
});

function startDrag(event: PointerEvent) {
  if (isDisabled.value || props.placed || !props.canPlace) return;
  const target = event.currentTarget;
  if (target instanceof Element) target.setPointerCapture(event.pointerId);
  event.preventDefault();
  emit("drag-start", event);
}

function preventTouchMove(event: TouchEvent) {
  if (isDisabled.value || props.placed || !props.canPlace) return;
  event.preventDefault();
}
</script>

<template>
  <button
    class="piece-tile"
    :class="{
      'piece-tile--selected': selected,
      'piece-tile--disabled': isDisabled,
      'piece-tile--unavailable': !canPlace && !placed,
    }"
    type="button"
    :disabled="isDisabled || placed || !canPlace"
    :aria-pressed="selected"
    :aria-label="`${label} piece${isDisabled ? ', unavailable' : selected ? ', selected' : ''}`"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
  >
    <svg
      class="piece-svg"
      viewBox="-0.05 -0.05 5.1 5.1"
      aria-hidden="true"
      @pointerdown="startDrag"
      @touchmove="preventTouchMove"
      @click.stop
    >
      <rect
        v-for="cell in centeredOrientation"
        :key="`${cell.x}-${cell.y}`"
        :x="cell.x + 0.05"
        :y="cell.y + 0.05"
        width="0.9"
        height="0.9"
        rx="0.16"
        :fill="color"
      />
    </svg>
  </button>
</template>
