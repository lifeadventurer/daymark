<script setup lang="ts">
import { onMounted, ref } from "vue";
import { generateOrientations } from "../engine/geometry";
import { pieceColors, pieceDefinitions } from "../data/pieces";
import type { GridPoint } from "../engine/types";

type PentominoId =
  "f" | "l" | "i" | "p" | "n" | "t" | "u" | "v" | "w" | "x" | "y" | "z";

interface Candidate {
  pieceId: PentominoId;
  cells: GridPoint[];
}

interface Tiling {
  width: number;
  height: number;
  placements: Candidate[];
}

const pentominoIds: PentominoId[] = [
  "f",
  "l",
  "i",
  "p",
  "n",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];
const pentominoPieces = pieceDefinitions.filter((piece) =>
  pentominoIds.includes(piece.id as PentominoId),
);
const rectangleSizes = [
  { width: 10, height: 6 },
  { width: 12, height: 5 },
  { width: 15, height: 4 },
  { width: 20, height: 3 },
];

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);
const tilings: Tiling[] = rectangleSizes.map(({ width, height }) => ({
  width,
  height,
  placements: findRectangleTiling(width, height),
}));

onMounted(() => {
  dialogRef.value?.focus();
});

function findRectangleTiling(width: number, height: number): Candidate[] {
  const allCells = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({ x, y })),
  ).flat();
  const candidatesByCell = new Map<string, Candidate[]>();

  for (const piece of pentominoPieces) {
    for (const orientation of generateOrientations(piece)) {
      const pieceWidth = Math.max(...orientation.map((cell) => cell.x)) + 1;
      const pieceHeight = Math.max(...orientation.map((cell) => cell.y)) + 1;
      for (let y = 0; y <= height - pieceHeight; y += 1) {
        for (let x = 0; x <= width - pieceWidth; x += 1) {
          const cells = orientation.map((cell) => ({
            x: x + cell.x,
            y: y + cell.y,
          }));
          const candidate = {
            pieceId: piece.id as PentominoId,
            cells,
          };
          for (const cell of cells) {
            const candidates = candidatesByCell.get(cellKey(cell)) ?? [];
            candidates.push(candidate);
            candidatesByCell.set(cellKey(cell), candidates);
          }
        }
      }
    }
  }

  function search(
    usedPieceIds: Set<PentominoId>,
    occupied: Set<string>,
    placements: Candidate[],
  ): Candidate[] | undefined {
    if (placements.length === pentominoPieces.length) return placements;

    const nextCell = allCells
      .filter((cell) => !occupied.has(cellKey(cell)))
      .map((cell) => ({
        candidates: (candidatesByCell.get(cellKey(cell)) ?? []).filter(
          (candidate) =>
            !usedPieceIds.has(candidate.pieceId) &&
            candidate.cells.every(
              (candidateCell) => !occupied.has(cellKey(candidateCell)),
            ),
        ),
      }))
      .sort(
        (first, second) => first.candidates.length - second.candidates.length,
      )[0];

    if (!nextCell || nextCell.candidates.length === 0) return undefined;

    for (const candidate of nextCell.candidates) {
      const nextUsedPieceIds = new Set(usedPieceIds);
      nextUsedPieceIds.add(candidate.pieceId);
      const nextOccupied = new Set(occupied);
      candidate.cells.forEach((cell) => nextOccupied.add(cellKey(cell)));
      const solution = search(nextUsedPieceIds, nextOccupied, [
        ...placements,
        candidate,
      ]);
      if (solution) return solution;
    }

    return undefined;
  }

  return search(new Set(), new Set(), []) ?? [];
}

function cellKey(cell: GridPoint): string {
  return `${cell.x},${cell.y}`;
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    emit("close");
    return;
  }
  trapFocus(event);
}

function trapFocus(event: KeyboardEvent) {
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
</script>

<template>
  <div class="tilings-modal" @click.self="emit('close')">
    <section
      ref="dialogRef"
      class="tilings-modal__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tilings-modal-title"
      @keydown="handleKeydown"
    >
      <header class="tilings-modal__header">
        <div>
          <p class="tilings-modal__eyebrow">12 pieces · 4 rectangles</p>
          <h2 id="tilings-modal-title">Four rectangles</h2>
          <p class="tilings-modal__intro">
            The same twelve pentominoes can fill each of these shapes.
          </p>
        </div>
        <button
          class="tilings-modal__close"
          type="button"
          aria-label="Close rectangle tilings"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div class="tilings-modal__list">
        <figure
          v-for="tiling in tilings"
          :key="`${tiling.width}-${tiling.height}`"
          class="tilings-modal__figure"
        >
          <figcaption>{{ tiling.width }} × {{ tiling.height }}</figcaption>
          <svg
            class="tilings-modal__svg"
            :viewBox="`0 0 ${tiling.width} ${tiling.height}`"
            role="img"
            :aria-label="`${tiling.width} by ${tiling.height} rectangle tiled with twelve pentominoes`"
          >
            <g v-for="placement in tiling.placements" :key="placement.pieceId">
              <rect
                v-for="cell in placement.cells"
                :key="`${placement.pieceId}-${cell.x}-${cell.y}`"
                :x="cell.x + 0.035"
                :y="cell.y + 0.035"
                width="0.93"
                height="0.93"
                rx="0.12"
                :fill="pieceColors[placement.pieceId]"
              />
            </g>
            <rect
              x="0.02"
              y="0.02"
              :width="tiling.width - 0.04"
              :height="tiling.height - 0.04"
              fill="none"
              stroke="#b7c5b9"
              stroke-width="0.06"
            />
          </svg>
        </figure>
      </div>
    </section>
  </div>
</template>
