<script setup lang="ts">
import { computed } from "vue";
import { generateOrientations } from "../engine/geometry";
import type { PieceDefinition } from "../engine/types";

const props = defineProps<{
  selectedPiece?: PieceDefinition;
  canReset: boolean;
  dragging: boolean;
}>();

const canTransform = computed(
  () =>
    !props.dragging &&
    Boolean(
      props.selectedPiece &&
      generateOrientations(props.selectedPiece).length > 1,
    ),
);

const emit = defineEmits<{
  "rotate-left": [];
  "rotate-right": [];
  "flip-horizontal": [];
  "flip-vertical": [];
  reset: [];
}>();
</script>

<template>
  <div class="piece-controls" aria-label="Piece controls">
    <div class="piece-controls__buttons">
      <button
        type="button"
        :disabled="!canTransform"
        aria-label="Rotate selected piece left"
        title="Rotate left (Shift+R)"
        @click.stop="emit('rotate-left')"
      >
        <svg class="piece-control-icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M7 5H3l3-3" />
          <path d="M3 5a7 7 0 1 1-1 7" />
        </svg>
      </button>
      <button
        type="button"
        :disabled="!canTransform"
        aria-label="Rotate selected piece right"
        title="Rotate right (R)"
        @click.stop="emit('rotate-right')"
      >
        <svg class="piece-control-icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M13 5h4l-3-3" />
          <path d="M17 5a7 7 0 1 0 1 7" />
        </svg>
      </button>
      <button
        type="button"
        :disabled="!canTransform"
        aria-label="Flip selected piece horizontally"
        title="Flip horizontally (H)"
        @click.stop="emit('flip-horizontal')"
      >
        <svg class="piece-control-icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M10 3v14" />
          <path d="m6 6-3 3 3 3" />
          <path d="m14 6 3 3-3 3" />
        </svg>
      </button>
      <button
        type="button"
        :disabled="!canTransform"
        aria-label="Flip selected piece vertically"
        title="Flip vertically (V)"
        @click.stop="emit('flip-vertical')"
      >
        <svg class="piece-control-icon" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M3 10h14" />
          <path d="m6 6 3-3 3 3" />
          <path d="m6 14 3 3 3-3" />
        </svg>
      </button>
    </div>
    <button
      class="piece-controls__reset"
      type="button"
      :disabled="!canReset"
      aria-label="Reset pieces"
      title="Reset pieces"
      @click.stop="emit('reset')"
    >
      <svg class="piece-control-icon" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M4 8a6 6 0 1 1 1 6" />
        <path d="M4 4v4h4" />
      </svg>
    </button>
  </div>
</template>
