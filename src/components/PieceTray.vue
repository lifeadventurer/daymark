<script setup lang="ts">
import { computed } from "vue";
import PieceTile from "./PieceTile.vue";
import type { PieceDefinition } from "../engine/types";

const props = defineProps<{
  pieces: PieceDefinition[];
  selectedPieceId: string | null;
  placedPieceIds: string[];
  labels: Record<string, string>;
  colors: Record<string, string>;
  orientations: Record<string, number>;
  canPlaceMore: boolean;
  canReset: boolean;
  dragging: boolean;
}>();

const canTransform = computed(
  () =>
    !props.dragging &&
    props.pieces.some((piece) => piece.id === props.selectedPieceId),
);

const emit = defineEmits<{
  select: [pieceId: string];
  "drag-start": [pieceId: string, event: PointerEvent];
  "rotate-left": [];
  "rotate-right": [];
  "flip-horizontal": [];
  "flip-vertical": [];
  reset: [];
}>();
</script>

<template>
  <section class="tray" aria-label="Piece tray">
    <div class="piece-controls" aria-label="Piece controls">
      <div class="piece-controls__buttons">
        <button
          type="button"
          :disabled="!canTransform"
          aria-label="Rotate selected piece left"
          title="Rotate left"
          @click.stop="emit('rotate-left')"
        >
          <svg
            class="piece-control-icon"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M7 5H3l3-3" />
            <path d="M3 5a7 7 0 1 1-1 7" />
          </svg>
        </button>
        <button
          type="button"
          :disabled="!canTransform"
          aria-label="Rotate selected piece right"
          title="Rotate right"
          @click.stop="emit('rotate-right')"
        >
          <svg
            class="piece-control-icon"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M13 5h4l-3-3" />
            <path d="M17 5a7 7 0 1 0 1 7" />
          </svg>
        </button>
        <button
          type="button"
          :disabled="!canTransform"
          aria-label="Flip selected piece horizontally"
          title="Flip horizontally"
          @click.stop="emit('flip-horizontal')"
        >
          <svg
            class="piece-control-icon"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M10 3v14" />
            <path d="m6 6-3 3 3 3" />
            <path d="m14 6 3 3-3 3" />
          </svg>
        </button>
        <button
          type="button"
          :disabled="!canTransform"
          aria-label="Flip selected piece vertically"
          title="Flip vertically"
          @click.stop="emit('flip-vertical')"
        >
          <svg
            class="piece-control-icon"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
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
    <div class="piece-grid">
      <PieceTile
        v-for="piece in pieces"
        :key="piece.id"
        :piece="piece"
        :label="labels[piece.id] ?? piece.id"
        :color="colors[piece.id] ?? '#718277'"
        :selected="selectedPieceId === piece.id"
        :placed="placedPieceIds.includes(piece.id)"
        :can-place="canPlaceMore"
        :orientation-index="orientations[piece.id] ?? 0"
        @select="emit('select', piece.id)"
        @drag-start="emit('drag-start', piece.id, $event)"
      />
    </div>
  </section>
</template>
