<script setup lang="ts">
import PieceTile from "./PieceTile.vue";
import type { PieceDefinition } from "../engine/types";

defineProps<{
  pieces: PieceDefinition[];
  selectedPieceId: string | null;
  placedPieceIds: string[];
  labels: Record<string, string>;
  colors: Record<string, string>;
  orientations: Record<string, number>;
  canPlaceMore: boolean;
}>();

const emit = defineEmits<{
  select: [pieceId: string];
  "drag-start": [pieceId: string, event: PointerEvent];
  rotate: [];
  flip: [];
}>();
</script>

<template>
  <section class="tray" aria-label="Piece tray">
    <div v-if="selectedPieceId" class="piece-controls" aria-label="Piece controls">
      <div class="piece-controls__buttons">
        <button
          type="button"
          aria-label="Rotate selected piece"
          title="Rotate"
          @click.stop="emit('rotate')"
        >↻</button>
        <button
          type="button"
          aria-label="Flip selected piece"
          title="Flip"
          @click.stop="emit('flip')"
        >⇄</button>
      </div>
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
