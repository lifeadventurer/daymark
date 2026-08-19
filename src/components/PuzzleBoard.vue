<script setup lang="ts">
import { computed, ref } from "vue";
import { getBoardBounds } from "../engine/board";
import { getPlacementCells } from "../engine/placement";
import type {
  BoardDefinition,
  PieceDefinition,
  PiecePlacement,
} from "../engine/types";

interface BoardPiece {
  piece: PieceDefinition;
  placement: PiecePlacement;
  color: string;
}

const props = defineProps<{
  board: BoardDefinition;
  targetDate: number;
  placedPieces: BoardPiece[];
  preview: BoardPiece | null;
  previewValid: boolean;
}>();

const emit = defineEmits<{
  "drag-start": [pieceId: string, event: PointerEvent];
  "select-piece": [pieceId: string];
  nudge: [pieceId: string, delta: { x: number; y: number }];
}>();

const svgRef = ref<SVGSVGElement | null>(null);
const bounds = computed(() => getBoardBounds(props.board));
const viewBox = computed(
  () =>
    `${bounds.value.minX - 0.12} ${bounds.value.minY - 0.12} ${bounds.value.maxX - bounds.value.minX + 1.24} ${bounds.value.maxY - bounds.value.minY + 1.24}`,
);

function placementCells(boardPiece: BoardPiece) {
  return getPlacementCells(boardPiece.piece, boardPiece.placement);
}

function getGridPointFromClient(clientX: number, clientY: number) {
  const svg = svgRef.value;
  if (!svg) return undefined;

  const rect = svg.getBoundingClientRect();
  if (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  ) {
    return undefined;
  }

  const logicalWidth = bounds.value.maxX - bounds.value.minX + 1.24;
  const logicalHeight = bounds.value.maxY - bounds.value.minY + 1.24;
  return {
    x:
      ((clientX - rect.left) / rect.width) * logicalWidth +
      bounds.value.minX -
      0.12,
    y:
      ((clientY - rect.top) / rect.height) * logicalHeight +
      bounds.value.minY -
      0.12,
  };
}

function handlePieceKeydown(event: KeyboardEvent, pieceId: string) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    emit("select-piece", pieceId);
    return;
  }

  const deltas: Record<string, { x: number; y: number }> = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
  };
  const delta = deltas[event.key];
  if (!delta) return;
  event.preventDefault();
  emit("nudge", pieceId, delta);
}

defineExpose({ getGridPointFromClient });
</script>

<template>
  <div class="board-shell">
    <svg
      ref="svgRef"
      class="board-svg"
      :viewBox="viewBox"
      role="img"
      :aria-label="`Calendar puzzle board. Leave date ${targetDate} open.`"
    >
      <defs>
        <filter id="cell-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow
            dx="0"
            dy="0.07"
            stdDeviation="0.06"
            flood-color="#17211c"
            flood-opacity="0.14"
          />
        </filter>
      </defs>
      <g filter="url(#cell-shadow)">
        <g v-for="cell in board.cells" :key="`${cell.x}-${cell.y}`">
          <rect
            :x="cell.x + 0.045"
            :y="cell.y + 0.045"
            width="0.91"
            height="0.91"
            rx="0.16"
            :class="[
              'board-cell',
              {
                'board-cell--target': cell.date === targetDate,
                'board-cell--blank': cell.playable === false,
              },
            ]"
          />
          <text
            v-if="cell.date !== undefined"
            :x="cell.x + 0.5"
            :y="cell.y + 0.59"
            text-anchor="middle"
            :class="[
              'board-number',
              { 'board-number--target': cell.date === targetDate },
            ]"
          >
            {{ cell.date }}
          </text>
          <circle
            v-if="cell.date === targetDate"
            :cx="cell.x + 0.5"
            :cy="cell.y + 0.81"
            r="0.025"
            class="target-dot"
          />
        </g>
      </g>
      <g
        v-for="boardPiece in placedPieces"
        :key="boardPiece.piece.id"
        class="placed-piece"
        role="button"
        tabindex="0"
        :aria-label="`Placed ${boardPiece.piece.id} piece. Use arrow keys to move.`"
        @pointerdown="emit('drag-start', boardPiece.piece.id, $event)"
        @keydown="handlePieceKeydown($event, boardPiece.piece.id)"
      >
        <rect
          v-for="cell in placementCells(boardPiece)"
          :key="`${boardPiece.piece.id}-${cell.x}-${cell.y}`"
          :x="cell.x + 0.055"
          :y="cell.y + 0.055"
          width="0.89"
          height="0.89"
          rx="0.15"
          :fill="boardPiece.color"
        />
      </g>
      <g
        v-if="preview"
        class="preview-piece"
        :class="{ 'preview-piece--invalid': !previewValid }"
        aria-hidden="true"
      >
        <rect
          v-for="cell in placementCells(preview)"
          :key="`preview-${cell.x}-${cell.y}`"
          :x="cell.x + 0.055"
          :y="cell.y + 0.055"
          width="0.89"
          height="0.89"
          rx="0.15"
          :fill="preview.color"
        />
      </g>
    </svg>
  </div>
</template>
