<script setup lang="ts">
import { computed, ref } from "vue";
import { getBoardBounds, getBoardCell } from "../engine/board";
import { getPlacementCells } from "../engine/placement";
import type {
  BoardCell,
  BoardDefinition,
  GridPoint,
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
  monthName: string;
  dateValue: string;
  placedPieces: BoardPiece[];
  preview: BoardPiece | null;
  previewValid: boolean;
  placementEnabled: boolean;
}>();

const placedPieceElements = new Map<string, SVGGElement>();

const emit = defineEmits<{
  "drag-start": [pieceId: string, event: PointerEvent];
  "select-piece": [pieceId: string];
  nudge: [pieceId: string, delta: { x: number; y: number }];
  "cell-select": [point: GridPoint];
  "date-change": [event: Event];
}>();

const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const boardPadding = {
  top: 0.58,
  right: 0.12,
  bottom: 0.12,
  left: 0.12,
};
const svgRef = ref<SVGSVGElement | null>(null);
const bounds = computed(() => getBoardBounds(props.board));
const viewport = computed(() => ({
  x: bounds.value.minX - boardPadding.left,
  y: bounds.value.minY - boardPadding.top,
  width:
    bounds.value.maxX -
    bounds.value.minX +
    1 +
    boardPadding.left +
    boardPadding.right,
  height:
    bounds.value.maxY -
    bounds.value.minY +
    1 +
    boardPadding.top +
    boardPadding.bottom,
}));
const viewBox = computed(
  () =>
    `${viewport.value.x} ${viewport.value.y} ${viewport.value.width} ${viewport.value.height}`,
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

  const point = {
    x:
      ((clientX - rect.left) / rect.width) * viewport.value.width +
      viewport.value.x,
    y:
      ((clientY - rect.top) / rect.height) * viewport.value.height +
      viewport.value.y,
  };

  return getBoardCell(props.board, {
    x: Math.floor(point.x),
    y: Math.floor(point.y),
  })
    ? point
    : undefined;
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

function handleBoardClick(event: MouseEvent) {
  if (!props.placementEnabled) return;
  const target = event.target;
  if (target instanceof Element && target.closest(".placed-piece")) return;

  const point = getGridPointFromClient(event.clientX, event.clientY);
  if (!point) return;
  emit("cell-select", {
    x: Math.floor(point.x) + 0.5,
    y: Math.floor(point.y) + 0.5,
  });
}

function handleCellKeydown(event: KeyboardEvent, cell: BoardCell) {
  if (!props.placementEnabled || cell.playable === false) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  emit("cell-select", { x: cell.x + 0.5, y: cell.y + 0.5 });
}

function handlePlacedPointerDown(event: PointerEvent, pieceId: string) {
  // The placed piece is removed from the SVG as soon as dragging starts. Keep
  // pointer capture on the persistent board instead of the piece group so
  // mobile browsers do not hand the gesture back to page scrolling.
  svgRef.value?.setPointerCapture(event.pointerId);
  event.preventDefault();
  emit("drag-start", pieceId, event);
}

function setPlacedPieceElement(pieceId: string, element: unknown) {
  if (element instanceof SVGGElement) {
    placedPieceElements.set(pieceId, element);
  } else {
    placedPieceElements.delete(pieceId);
  }
}

function focusPlacedPiece(pieceId: string) {
  placedPieceElements.get(pieceId)?.focus();
}

defineExpose({ getGridPointFromClient, focusPlacedPiece });
</script>

<template>
  <div class="board-shell">
    <div class="board-heading">
      <span class="board-heading__month" aria-live="polite">
        {{ monthName }}
      </span>
      <input
        :value="dateValue"
        type="date"
        aria-label="Choose puzzle date"
        @change="emit('date-change', $event)"
      />
    </div>
    <div class="board-graphic">
      <svg
        ref="svgRef"
        class="board-svg"
        :class="{ 'board-svg--placement-ready': placementEnabled }"
        :viewBox="viewBox"
        :role="placementEnabled ? 'group' : 'img'"
        :aria-label="`Calendar puzzle board. Leave date ${targetDate} open.${placementEnabled ? ' Tap a cell to place the selected piece.' : ''}`"
        @click="handleBoardClick"
      >
        <g class="board-weekdays" aria-hidden="true">
          <text
            v-for="(weekday, index) in weekdayLabels"
            :key="weekday"
            :x="bounds.minX + index + 0.5"
            :y="bounds.minY - 0.23"
            text-anchor="middle"
            class="board-weekday"
          >
            {{ weekday }}
          </text>
        </g>
        <g>
          <g
            v-for="cell in board.cells"
            :key="`${cell.x}-${cell.y}`"
            class="board-cell-group"
            :role="
              placementEnabled && cell.playable !== false ? 'button' : undefined
            "
            :tabindex="
              placementEnabled && cell.playable !== false ? 0 : undefined
            "
            :aria-label="
              placementEnabled && cell.playable !== false
                ? cell.date !== undefined
                  ? `Place selected piece on ${cell.date}`
                  : 'Place selected piece on open cell'
                : undefined
            "
            @keydown="handleCellKeydown($event, cell)"
          >
            <rect
              v-if="cell.playable !== false"
              :x="cell.x + 0.045"
              :y="cell.y + 0.095"
              width="0.91"
              height="0.91"
              rx="0.16"
              class="board-cell-shadow"
            />
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
          :ref="
            (element) => setPlacedPieceElement(boardPiece.piece.id, element)
          "
          class="placed-piece"
          role="button"
          tabindex="0"
          :aria-label="`Placed ${boardPiece.piece.id} piece. Use arrow keys to move.`"
          @pointerdown="handlePlacedPointerDown($event, boardPiece.piece.id)"
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
  </div>
</template>
