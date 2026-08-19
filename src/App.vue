<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import DaymarkMark from "./components/DaymarkMark.vue";
import PuzzleBoard from "./components/PuzzleBoard.vue";
import PieceTray from "./components/PieceTray.vue";
import {
  temporaryBoard,
  temporaryPieces,
  pieceColors,
  pieceLabels,
} from "./data/temporaryPuzzle";
import {
  generateOrientations,
  orientationKey,
  reflectCells,
  reflectCellsVertically,
  rotateCells,
} from "./engine/geometry";
import { isBoardStateLegal, isPlacementLegal } from "./engine/placement";
import type { GridPoint, PiecePlacement } from "./engine/types";
import { dateFromInputValue, getDateContext } from "./utils/date";
import {
  loadRecordStore,
  saveRecordStore,
  type SavedPuzzleRecord,
} from "./utils/storage";

const selectedDate = ref(new Date());
const selectedPieceId = ref<string | null>(null);
const placedPieces = ref<RenderedPiece[]>([]);
const draggingPieceId = ref<string | null>(null);
const previewPlacement = ref<PiecePlacement | null>(null);
const previewValid = ref(false);
const dragMoved = ref(false);
const dragOutsideBoard = ref(false);
const dragPointer = ref<{ x: number; y: number } | null>(null);
const dragReturn = ref<{ piece: RenderedPiece; index: number } | null>(null);
const moveCount = ref(0);
const completed = ref(false);
const completedAt = ref<string | null>(null);
const records = ref(loadRecordStore());
const pieceOrientations = ref<Record<string, number>>({});
const pieceLimit = 6;
const boardRef = ref<{
  getGridPointFromClient: (
    clientX: number,
    clientY: number,
  ) => { x: number; y: number } | undefined;
} | null>(null);
const dateContext = computed(() => getDateContext(selectedDate.value));
const placedPieceIds = computed(() =>
  placedPieces.value.map(({ piece }) => piece.id),
);
const canReset = computed(
  () => placedPieces.value.length > 0 || Boolean(dragReturn.value),
);
const draggedPiece = computed(() =>
  temporaryPieces.find((piece) => piece.id === draggingPieceId.value),
);
const dragGhostOrientation = computed(() => {
  if (!draggedPiece.value) return [];
  return (
    generateOrientations(draggedPiece.value)[
      getOrientationIndex(draggedPiece.value)
    ] ?? []
  );
});
const dragGhostSize = computed(() => ({
  width: Math.max(...dragGhostOrientation.value.map((cell) => cell.x), 0) + 1,
  height: Math.max(...dragGhostOrientation.value.map((cell) => cell.y), 0) + 1,
}));
const dragGhostViewBox = computed(
  () =>
    `-0.08 -0.08 ${dragGhostSize.value.width + 0.16} ${dragGhostSize.value.height + 0.16}`,
);
const dragGhostStyle = computed(() => {
  if (!dragPointer.value) return {};

  const cellSize = 34;
  return {
    left: `${dragPointer.value.x + 14}px`,
    top: `${dragPointer.value.y + 14}px`,
    width: `${dragGhostSize.value.width * cellSize}px`,
    height: `${dragGhostSize.value.height * cellSize}px`,
  };
});
const boardStatus = computed(() => {
  if (completed.value) return "Complete";
  if (draggingPieceId.value && dragReturn.value && !dragMoved.value)
    return "Selected piece — drag to move or release to keep";
  if (draggingPieceId.value && previewPlacement.value)
    return previewValid.value
      ? "Good fit — release to place"
      : "That spot is blocked";
  if (draggingPieceId.value) return "Drag onto the canvas";
  return placedPieces.value.length
    ? `${placedPieces.value.length} of ${pieceLimit} selected`
    : "Ready to arrange";
});

interface RenderedPiece {
  piece: (typeof temporaryPieces)[number];
  placement: PiecePlacement;
  color: string;
}

function updateDate(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLInputElement)) return;
  const nextDate = dateFromInputValue(input.value);
  if (!nextDate || dateContext.value.isoDate === input.value) return;

  endDrag();
  saveCurrentPuzzle();
  selectedDate.value = nextDate;
  loadPuzzleForDate(input.value);
}

function resetPuzzle() {
  endDrag();
  selectedPieceId.value = null;
  placedPieces.value = [];
  moveCount.value = 0;
  completed.value = false;
  completedAt.value = null;
  pieceOrientations.value = {};
  saveCurrentPuzzle();
}

function selectPiece(pieceId: string) {
  selectedPieceId.value = selectedPieceId.value === pieceId ? null : pieceId;
}

function startDrag(pieceId: string, event: PointerEvent) {
  const piece = temporaryPieces.find((candidate) => candidate.id === pieceId);
  if (
    !piece ||
    piece.enabled === false ||
    placedPieceIds.value.includes(pieceId) ||
    placedPieces.value.length >= pieceLimit
  )
    return;

  beginDrag(pieceId, event, true);
}

function startPlacedDrag(pieceId: string, event: PointerEvent) {
  const index = placedPieces.value.findIndex(
    ({ piece }) => piece.id === pieceId,
  );
  const renderedPiece = placedPieces.value[index];
  if (!renderedPiece || draggingPieceId.value) return;

  placedPieces.value = placedPieces.value.filter(
    ({ piece }) => piece.id !== pieceId,
  );
  dragReturn.value = { piece: renderedPiece, index };
  beginDrag(pieceId, event);
}

function selectPlacedPiece(pieceId: string) {
  if (placedPieceIds.value.includes(pieceId)) selectedPieceId.value = pieceId;
}

function nudgePlacedPiece(pieceId: string, delta: GridPoint) {
  const index = placedPieces.value.findIndex(
    ({ piece }) => piece.id === pieceId,
  );
  const renderedPiece = placedPieces.value[index];
  if (!renderedPiece || draggingPieceId.value) return;

  const candidatePlacement: PiecePlacement = {
    ...renderedPiece.placement,
    origin: {
      x: renderedPiece.placement.origin.x + delta.x,
      y: renderedPiece.placement.origin.y + delta.y,
    },
  };
  const otherPlacements = placedPieces.value
    .filter((_, placementIndex) => placementIndex !== index)
    .map(({ placement }) => placement);
  if (
    !isPlacementLegal(
      temporaryBoard,
      renderedPiece.piece,
      candidatePlacement,
      otherPlacements,
      new Map(temporaryPieces.map((piece) => [piece.id, piece])),
      dateContext.value.dateNumber,
    )
  ) {
    return;
  }

  const updated = [...placedPieces.value];
  updated[index] = { ...renderedPiece, placement: candidatePlacement };
  placedPieces.value = updated;
  moveCount.value += 1;
  evaluateCompletion();
  saveCurrentPuzzle();
}

function beginDrag(
  pieceId: string,
  event: PointerEvent,
  startsOutsideBoard = false,
) {
  const initialPlacement = dragReturn.value?.piece.placement;
  event.preventDefault();
  selectedPieceId.value = pieceId;
  draggingPieceId.value = pieceId;
  dragPointer.value = { x: event.clientX, y: event.clientY };
  previewPlacement.value = initialPlacement
    ? {
        ...initialPlacement,
        origin: { ...initialPlacement.origin },
      }
    : null;
  previewValid.value = Boolean(initialPlacement);
  dragMoved.value = false;
  dragOutsideBoard.value = startsOutsideBoard;
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", cancelDrag);
}

function getOrientationIndex(piece: (typeof temporaryPieces)[number]) {
  const orientations = generateOrientations(piece);
  if (orientations.length === 0) return 0;
  return (
    (((pieceOrientations.value[piece.id] ?? 0) % orientations.length) +
      orientations.length) %
    orientations.length
  );
}

function changeSelectedOrientation(
  action: "rotate-left" | "rotate-right" | "flip-horizontal" | "flip-vertical",
) {
  const pieceId = selectedPieceId.value;
  const piece = temporaryPieces.find((candidate) => candidate.id === pieceId);
  if (!piece || draggingPieceId.value) return;

  const orientations = generateOrientations(piece);
  const currentIndex = getOrientationIndex(piece);
  const current = orientations[currentIndex] ?? orientations[0];
  if (!current) return;

  const transformed = (() => {
    switch (action) {
      case "rotate-left":
        return rotateCells(rotateCells(rotateCells(current)));
      case "rotate-right":
        return rotateCells(current);
      case "flip-horizontal":
        return reflectCells(current);
      case "flip-vertical":
        return reflectCellsVertically(current);
    }
  })();
  const nextIndex = orientations.findIndex(
    (candidate) => orientationKey(candidate) === orientationKey(transformed),
  );
  if (nextIndex < 0) return;

  const placedIndex = placedPieces.value.findIndex(
    ({ piece: placedPiece }) => placedPiece.id === piece.id,
  );
  if (placedIndex >= 0) {
    const currentPlacement = placedPieces.value[placedIndex].placement;
    const candidatePlacement = { ...currentPlacement, orientation: nextIndex };
    const otherPlacements = placedPieces.value
      .filter((_, index) => index !== placedIndex)
      .map(({ placement }) => placement);
    const isLegal = isPlacementLegal(
      temporaryBoard,
      piece,
      candidatePlacement,
      otherPlacements,
      new Map(temporaryPieces.map((candidate) => [candidate.id, candidate])),
      dateContext.value.dateNumber,
    );
    if (!isLegal) return;

    const updated = [...placedPieces.value];
    updated[placedIndex] = {
      ...updated[placedIndex],
      placement: candidatePlacement,
    };
    placedPieces.value = updated;
  }

  pieceOrientations.value = {
    ...pieceOrientations.value,
    [piece.id]: nextIndex,
  };
  moveCount.value += 1;
  evaluateCompletion();
  saveCurrentPuzzle();
}

function handlePointerMove(event: PointerEvent) {
  if (!draggedPiece.value || !boardRef.value) return;

  dragPointer.value = { x: event.clientX, y: event.clientY };
  dragMoved.value = true;
  const point = boardRef.value.getGridPointFromClient(
    event.clientX,
    event.clientY,
  );
  if (!point) {
    dragOutsideBoard.value = true;
    previewPlacement.value = null;
    previewValid.value = false;
    return;
  }

  dragOutsideBoard.value = false;
  const orientationIndex = getOrientationIndex(draggedPiece.value);
  const orientation =
    generateOrientations(draggedPiece.value)[orientationIndex] ?? [];
  const width = Math.max(...orientation.map((cell) => cell.x), 0) + 1;
  const height = Math.max(...orientation.map((cell) => cell.y), 0) + 1;
  const placement: PiecePlacement = {
    pieceId: draggedPiece.value.id,
    orientation: orientationIndex,
    origin: {
      x: Math.round(point.x - width / 2),
      y: Math.round(point.y - height / 2),
    },
  };

  previewPlacement.value = placement;
  previewValid.value = isPlacementLegal(
    temporaryBoard,
    draggedPiece.value,
    placement,
    placedPieces.value.map(({ placement: existing }) => existing),
    new Map(temporaryPieces.map((piece) => [piece.id, piece])),
    dateContext.value.dateNumber,
  );
}

function endDrag(_event?: PointerEvent, restorePlacedPiece = false) {
  if (!draggingPieceId.value) return;

  const piece = draggedPiece.value;
  const placedSuccessfully =
    piece && dragMoved.value && previewPlacement.value && previewValid.value;
  if (placedSuccessfully && piece && previewPlacement.value) {
    placedPieces.value = [
      ...placedPieces.value,
      {
        piece,
        placement: previewPlacement.value,
        color: pieceColors[piece.id] ?? "#718277",
      },
    ];
    moveCount.value += 1;
    pieceOrientations.value = {
      ...pieceOrientations.value,
      [piece.id]: previewPlacement.value.orientation,
    };
    selectedPieceId.value = null;
  } else if (
    dragReturn.value &&
    (restorePlacedPiece || !dragOutsideBoard.value)
  ) {
    const restored = [...placedPieces.value];
    restored.splice(dragReturn.value.index, 0, dragReturn.value.piece);
    placedPieces.value = restored;
  }

  evaluateCompletion();
  saveCurrentPuzzle();

  window.removeEventListener("pointermove", handlePointerMove);
  window.removeEventListener("pointerup", endDrag);
  window.removeEventListener("pointercancel", cancelDrag);
  draggingPieceId.value = null;
  previewPlacement.value = null;
  previewValid.value = false;
  dragMoved.value = false;
  dragOutsideBoard.value = false;
  dragPointer.value = null;
  dragReturn.value = null;
}

function cancelDrag() {
  endDrag(undefined, true);
}

function evaluateCompletion() {
  const isComplete =
    placedPieces.value.length === pieceLimit &&
    isBoardStateLegal(
      temporaryBoard,
      new Map(temporaryPieces.map((piece) => [piece.id, piece])),
      placedPieces.value.map(({ placement }) => placement),
      dateContext.value.dateNumber,
    );

  completed.value = isComplete;
  completedAt.value = isComplete
    ? (completedAt.value ?? new Date().toISOString())
    : null;
}

function saveCurrentPuzzle(dateKey = dateContext.value.isoDate) {
  const puzzle: SavedPuzzleRecord = {
    placements: placedPieces.value.map(({ placement }) => ({
      pieceId: placement.pieceId,
      origin: { ...placement.origin },
      orientationIndex: placement.orientation,
    })),
    moveCount: moveCount.value,
    completed: completed.value,
    completedAt: completedAt.value,
  };
  records.value = {
    ...records.value,
    puzzles: { ...records.value.puzzles, [dateKey]: puzzle },
  };
  saveRecordStore(records.value);
}

function loadPuzzleForDate(dateKey: string) {
  const saved = records.value.puzzles[dateKey];
  const piecesById = new Map(temporaryPieces.map((piece) => [piece.id, piece]));
  const nextPlacements: RenderedPiece[] = [];
  const nextOrientations: Record<string, number> = {};
  let savedStateValid = !saved || saved.placements.length <= pieceLimit;

  if (saved && saved.placements.length <= pieceLimit) {
    for (const savedPlacement of saved.placements) {
      const piece = piecesById.get(savedPlacement.pieceId);
      if (
        !piece ||
        piece.enabled === false ||
        nextPlacements.some(({ piece: placed }) => placed.id === piece.id)
      ) {
        savedStateValid = false;
        nextPlacements.length = 0;
        break;
      }
      const orientationCount = generateOrientations(piece).length;
      const orientation =
        orientationCount > 0
          ? savedPlacement.orientationIndex % orientationCount
          : 0;
      const placement: PiecePlacement = {
        pieceId: piece.id,
        origin: { ...savedPlacement.origin },
        orientation,
      };
      if (
        !isPlacementLegal(
          temporaryBoard,
          piece,
          placement,
          nextPlacements.map(({ placement: existing }) => existing),
          piecesById,
          dateContext.value.dateNumber,
        )
      ) {
        savedStateValid = false;
        nextPlacements.length = 0;
        break;
      }
      nextPlacements.push({
        piece,
        placement,
        color: pieceColors[piece.id] ?? "#718277",
      });
      nextOrientations[piece.id] = orientation;
    }
  }

  placedPieces.value = nextPlacements;
  pieceOrientations.value = nextOrientations;
  moveCount.value = savedStateValid ? (saved?.moveCount ?? 0) : 0;
  completed.value = false;
  completedAt.value = savedStateValid ? (saved?.completedAt ?? null) : null;
  evaluateCompletion();
}

loadPuzzleForDate(dateContext.value.isoDate);

onBeforeUnmount(cancelDrag);
</script>

<template>
  <main class="app-shell">
    <div
      v-if="dragOutsideBoard && draggedPiece && dragPointer"
      class="drag-ghost"
      :style="dragGhostStyle"
      aria-hidden="true"
    >
      <svg class="drag-ghost__svg" :viewBox="dragGhostViewBox">
        <rect
          v-for="cell in dragGhostOrientation"
          :key="`drag-ghost-${cell.x}-${cell.y}`"
          :x="cell.x + 0.05"
          :y="cell.y + 0.05"
          width="0.9"
          height="0.9"
          rx="0.15"
          :fill="pieceColors[draggedPiece.id] ?? '#718277'"
          :stroke="pieceColors[draggedPiece.id] ?? '#718277'"
        />
      </svg>
      <span class="drag-ghost__return" aria-hidden="true">↩</span>
    </div>
    <header class="topbar">
      <a class="wordmark" href="/" aria-label="Daymark home">
        <DaymarkMark :size="40" />
        <span>Daymark</span>
      </a>
    </header>

    <section class="puzzle-layout" aria-label="Daymark puzzle">
      <div class="board-column">
        <span class="sr-only" aria-live="polite">
          {{ boardStatus }}
        </span>
        <PuzzleBoard
          ref="boardRef"
          :board="temporaryBoard"
          :target-date="dateContext.dateNumber"
          :month-name="dateContext.monthName"
          :date-value="dateContext.isoDate"
          :placed-pieces="placedPieces"
          :preview="
            draggedPiece && previewPlacement
              ? {
                  piece: draggedPiece,
                  placement: previewPlacement,
                  color: pieceColors[draggedPiece.id] ?? '#718277',
                }
              : null
          "
          :preview-valid="previewValid"
          @date-change="updateDate"
          @drag-start="startPlacedDrag"
          @select-piece="selectPlacedPiece"
          @nudge="nudgePlacedPiece"
        />
        <div
          v-if="completed && !draggingPieceId"
          class="completion-mark"
          role="status"
          aria-label="Puzzle complete"
        >
          ✓
          <span class="sr-only">Puzzle complete</span>
        </div>
      </div>

      <aside class="side-panel">
        <PieceTray
          :pieces="temporaryPieces"
          :selected-piece-id="selectedPieceId"
          :placed-piece-ids="placedPieceIds"
          :labels="pieceLabels"
          :colors="pieceColors"
          :orientations="pieceOrientations"
          :can-place-more="placedPieces.length < pieceLimit"
          :can-reset="canReset"
          :dragging="Boolean(draggingPieceId)"
          @select="selectPiece"
          @drag-start="startDrag"
          @rotate-left="changeSelectedOrientation('rotate-left')"
          @rotate-right="changeSelectedOrientation('rotate-right')"
          @flip-horizontal="changeSelectedOrientation('flip-horizontal')"
          @flip-vertical="changeSelectedOrientation('flip-vertical')"
          @reset="resetPuzzle"
        />
      </aside>
    </section>
  </main>
</template>
