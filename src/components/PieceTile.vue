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
const maxX = computed(() =>
  Math.max(...orientation.value.map((cell) => cell.x), 0),
);
const maxY = computed(() =>
  Math.max(...orientation.value.map((cell) => cell.y), 0),
);

function startDrag(event: PointerEvent) {
  if (props.placed) return;
  const target = event.currentTarget;
  if (target instanceof HTMLElement) target.setPointerCapture(event.pointerId);
  event.preventDefault();
  emit("drag-start", event);
}
</script>

<template>
  <button
    class="piece-tile"
    :class="{
      'piece-tile--selected': selected,
      'piece-tile--unavailable': !canPlace && !placed,
    }"
    type="button"
    :disabled="placed || !canPlace"
    :aria-label="`${label} piece${selected ? ', selected' : ''}`"
    @pointerdown="startDrag"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
  >
    <svg
      class="piece-svg"
      :viewBox="`-0.1 -0.1 ${maxX + 1.2} ${maxY + 1.2}`"
      aria-hidden="true"
    >
      <rect
        v-for="cell in orientation"
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
