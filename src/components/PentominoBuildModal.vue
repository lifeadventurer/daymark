<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { pieceColors, pieceDefinitions, pieceLabels } from "../data/pieces";
import { pentominoBuildChallenges } from "../data/pentominoBuildChallenges";
import { generateOrientations } from "../engine/geometry";
import { getTransformedOrientationIndex } from "../engine/orientation";
import { getCenteredPlacement, getPlacementCells } from "../engine/placement";
import PieceControls from "./PieceControls.vue";
import type {
  GridPoint,
  PieceDefinition,
  PiecePlacement,
} from "../engine/types";

interface BuildPlacement extends PiecePlacement {
  pieceId: string;
}

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);
const targetRef = ref<SVGSVGElement | null>(null);
const activeChallengeIndex = ref(0);
const selectedPieceId = ref<string | null>(null);
const placedPieces = ref<BuildPlacement[]>([]);
const orientations = ref<Record<string, number>>({});
const message = ref("");

const challenge = computed(
  () => pentominoBuildChallenges[activeChallengeIndex.value]!,
);
const pieces = computed(() =>
  challenge.value.placements
    .map((placement) =>
      pieceDefinitions.find((piece) => piece.id === placement.pieceId),
    )
    .filter((piece): piece is PieceDefinition => Boolean(piece)),
);
const selectedPiece = computed(() =>
  pieces.value.find((piece) => piece.id === selectedPieceId.value),
);
const targetCellKeys = computed(
  () => new Set(challenge.value.targetCells.map(pointKey)),
);
const isComplete = computed(() => {
  if (placedPieces.value.length !== pieces.value.length) return false;
  const covered = new Set(
    placedPieces.value.flatMap((placement) => {
      const piece = pieces.value.find(
        (candidate) => candidate.id === placement.pieceId,
      );
      return piece ? getPlacementCells(piece, placement).map(pointKey) : [];
    }),
  );
  return challenge.value.targetCells.every((cell) =>
    covered.has(pointKey(cell)),
  );
});
const statusMessage = computed(() => {
  if (isComplete.value) return "Complete — nine pieces, one shape.";
  if (message.value) return message.value;
  if (selectedPiece.value) {
    return `Place the ${pieceLabels[selectedPiece.value.id] ?? "selected piece"}.`;
  }
  return "Choose a piece, then tap its place.";
});

onMounted(() => {
  dialogRef.value?.focus();
  selectFirstAvailablePiece();
});

function selectFirstAvailablePiece() {
  selectedPieceId.value =
    pieces.value.find(
      (piece) =>
        !placedPieces.value.some((placement) => placement.pieceId === piece.id),
    )?.id ?? null;
}

function selectChallenge(index: number) {
  if (activeChallengeIndex.value === index) return;
  activeChallengeIndex.value = index;
  placedPieces.value = [];
  orientations.value = {};
  message.value = "";
  nextTick(selectFirstAvailablePiece);
}

function selectPiece(pieceId: string) {
  selectedPieceId.value = pieceId;
  message.value = "";
}

function getPieceOrientation(piece: PieceDefinition): GridPoint[] {
  return generateOrientations(piece)[orientations.value[piece.id] ?? 0] ?? [];
}

function getTileCells(piece: PieceDefinition): GridPoint[] {
  const cells = getPieceOrientation(piece);
  const maxX = Math.max(...cells.map((cell) => cell.x), 0);
  const maxY = Math.max(...cells.map((cell) => cell.y), 0);
  const offsetX = (5 - (maxX + 1)) / 2;
  const offsetY = (5 - (maxY + 1)) / 2;
  return cells.map((cell) => ({
    x: cell.x + offsetX,
    y: cell.y + offsetY,
  }));
}

function getPlacementCellsFor(placement: BuildPlacement): GridPoint[] {
  const piece = pieces.value.find(
    (candidate) => candidate.id === placement.pieceId,
  );
  return piece ? getPlacementCells(piece, placement) : [];
}

function isLegalPlacement(
  piece: PieceDefinition,
  placement: BuildPlacement,
  existingPlacements: BuildPlacement[],
): boolean {
  const cells = getPlacementCells(piece, placement);
  if (
    cells.length !== piece.cells.length ||
    !cells.every((cell) => targetCellKeys.value.has(pointKey(cell)))
  ) {
    return false;
  }

  const occupied = new Set(
    existingPlacements.flatMap((existing) =>
      getPlacementCellsFor(existing).map(pointKey),
    ),
  );
  return cells.every((cell) => !occupied.has(pointKey(cell)));
}

function handleTargetClick(event: MouseEvent) {
  const piece = selectedPiece.value;
  const svg = targetRef.value;
  if (!piece || !svg) {
    message.value = "Choose a piece first.";
    return;
  }

  const rect = svg.getBoundingClientRect();
  const point = {
    x: ((event.clientX - rect.left) / rect.width) * challenge.value.width,
    y: ((event.clientY - rect.top) / rect.height) * challenge.value.height,
  };
  const targetCell = { x: Math.floor(point.x), y: Math.floor(point.y) };
  if (!targetCellKeys.value.has(pointKey(targetCell))) {
    message.value = "Choose a cell inside the outline.";
    return;
  }

  const placement = getCenteredPlacement(
    piece,
    orientations.value[piece.id] ?? 0,
    { x: targetCell.x + 0.5, y: targetCell.y + 0.5 },
  );
  if (!placement) return;

  const existingPlacements = placedPieces.value.filter(
    (existing) => existing.pieceId !== piece.id,
  );
  const nextPlacement = { ...placement, pieceId: piece.id };
  if (!isLegalPlacement(piece, nextPlacement, existingPlacements)) {
    message.value = "That piece does not fit there.";
    return;
  }

  placedPieces.value = [...existingPlacements, nextPlacement];
  message.value = "";
  selectFirstAvailablePiece();
}

function selectPlacedPiece(pieceId: string) {
  selectedPieceId.value = pieceId;
  message.value = "";
}

function transformSelected(
  action: "rotate-left" | "rotate-right" | "flip-horizontal" | "flip-vertical",
) {
  const piece = selectedPiece.value;
  if (!piece) return;
  const currentIndex = orientations.value[piece.id] ?? 0;
  const nextIndex = getTransformedOrientationIndex(piece, currentIndex, action);
  if (nextIndex === undefined) return;

  const placed = placedPieces.value.find(
    (placement) => placement.pieceId === piece.id,
  );
  if (!placed) {
    orientations.value = { ...orientations.value, [piece.id]: nextIndex };
    return;
  }

  const nextPlacement = { ...placed, orientation: nextIndex };
  const existingPlacements = placedPieces.value.filter(
    (existing) => existing.pieceId !== piece.id,
  );
  if (!isLegalPlacement(piece, nextPlacement, existingPlacements)) {
    message.value = "That orientation does not fit here.";
    return;
  }

  orientations.value = { ...orientations.value, [piece.id]: nextIndex };
  placedPieces.value = [...existingPlacements, nextPlacement];
  message.value = "";
}

function resetPieces() {
  placedPieces.value = [];
  orientations.value = {};
  message.value = "";
  selectFirstAvailablePiece();
}

function trapFocus(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    emit("close");
    return;
  }
  if (event.key !== "Tab") return;

  const dialog = dialogRef.value;
  if (!dialog) return;
  const focusableElements = Array.from(
    dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
  if (focusableElements.length === 0) return;
  const first = focusableElements[0];
  const last = focusableElements.at(-1);
  if (!last) return;

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (event.shiftKey && document.activeElement === dialog) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}
</script>

<template>
  <div class="build-modal" @click.self="emit('close')">
    <section
      ref="dialogRef"
      class="build-modal__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="build-modal-title"
      @keydown="trapFocus"
    >
      <header class="build-modal__header">
        <div>
          <h2 id="build-modal-title">Build a shape</h2>
          <p class="build-modal__intro">Nine pieces. One silhouette.</p>
        </div>
        <button
          class="build-modal__close"
          type="button"
          aria-label="Close shape builder"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div
        class="build-modal__challenges"
        role="tablist"
        aria-label="Shape challenges"
      >
        <button
          v-for="(buildChallenge, index) in pentominoBuildChallenges"
          :key="buildChallenge.id"
          class="build-modal__challenge"
          :class="{
            'build-modal__challenge--active': activeChallengeIndex === index,
          }"
          type="button"
          role="tab"
          :aria-selected="activeChallengeIndex === index"
          @click="selectChallenge(index)"
        >
          {{ buildChallenge.label }}
        </button>
      </div>

      <div class="build-modal__board-wrap">
        <svg
          ref="targetRef"
          class="build-modal__board"
          :viewBox="`-0.12 -0.12 ${challenge.width + 0.24} ${challenge.height + 0.24}`"
          role="group"
          :aria-label="`${challenge.label} shape. Select a piece, then tap a cell to place it.`"
          @click="handleTargetClick"
        >
          <rect
            v-for="cell in challenge.targetCells"
            :key="`target-${pointKey(cell)}`"
            :x="cell.x + 0.04"
            :y="cell.y + 0.04"
            width="0.92"
            height="0.92"
            rx="0.14"
            class="build-modal__target-cell"
          />
          <g
            v-for="placement in placedPieces"
            :key="placement.pieceId"
            class="build-modal__placed-piece"
            :class="{
              'build-modal__placed-piece--selected':
                selectedPieceId === placement.pieceId,
            }"
            role="button"
            tabindex="0"
            :aria-label="`${pieceLabels[placement.pieceId] ?? placement.pieceId} placed piece`"
            @click.stop="selectPlacedPiece(placement.pieceId)"
          >
            <rect
              v-for="cell in getPlacementCellsFor(placement)"
              :key="`${placement.pieceId}-${pointKey(cell)}`"
              :x="cell.x + 0.07"
              :y="cell.y + 0.07"
              width="0.86"
              height="0.86"
              rx="0.14"
              :fill="pieceColors[placement.pieceId]"
            />
          </g>
        </svg>
      </div>

      <div class="build-modal__piece-heading">
        <span>Choose a piece</span>
        <span>{{ placedPieces.length }} / {{ pieces.length }}</span>
      </div>

      <PieceControls
        :selected-piece="selectedPiece"
        :can-reset="placedPieces.length > 0"
        :dragging="false"
        @rotate-left="transformSelected('rotate-left')"
        @rotate-right="transformSelected('rotate-right')"
        @flip-horizontal="transformSelected('flip-horizontal')"
        @flip-vertical="transformSelected('flip-vertical')"
        @reset="resetPieces"
      />

      <div class="build-modal__piece-grid" aria-label="Nine pentomino pieces">
        <button
          v-for="piece in pieces"
          :key="piece.id"
          class="build-modal__piece"
          :class="{
            'build-modal__piece--selected': selectedPieceId === piece.id,
            'build-modal__piece--placed': placedPieces.some(
              (placement) => placement.pieceId === piece.id,
            ),
          }"
          type="button"
          :aria-label="pieceLabels[piece.id]"
          :aria-pressed="selectedPieceId === piece.id"
          @click="selectPiece(piece.id)"
        >
          <svg viewBox="-0.05 -0.05 5.1 5.1" aria-hidden="true">
            <rect
              v-for="cell in getTileCells(piece)"
              :key="`${piece.id}-${cell.x}-${cell.y}`"
              :x="cell.x + 0.05"
              :y="cell.y + 0.05"
              width="0.9"
              height="0.9"
              rx="0.16"
              :fill="pieceColors[piece.id]"
            />
          </svg>
          <span>{{ piece.id.toUpperCase() }}</span>
        </button>
      </div>

      <p class="build-modal__status" role="status" aria-live="polite">
        {{ statusMessage }}
      </p>
    </section>
  </div>
</template>
