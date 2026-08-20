<script setup lang="ts">
import { computed } from "vue";
import PieceControls from "./PieceControls.vue";
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

const selectedPiece = computed(() =>
  props.pieces.find((piece) => piece.id === props.selectedPieceId),
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
    <PieceControls
      class="piece-controls--tray"
      :selected-piece="selectedPiece"
      :can-reset="canReset"
      :dragging="dragging"
      @rotate-left="emit('rotate-left')"
      @rotate-right="emit('rotate-right')"
      @flip-horizontal="emit('flip-horizontal')"
      @flip-vertical="emit('flip-vertical')"
      @reset="emit('reset')"
    />
    <div
      class="piece-grid"
      :class="{ 'piece-grid--dense': pieces.length > 12 }"
    >
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
