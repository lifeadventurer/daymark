<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue";
import { generateOrientations } from "../engine/geometry";
import { pieceColors, pieceDefinitions, pieceLabels } from "../data/pieces";
import type { GridPoint } from "../engine/types";
import PentominoBuildModal from "./PentominoBuildModal.vue";
import PentominoBuildGalleryModal from "./PentominoBuildGalleryModal.vue";
import PentominoTilingsModal from "./PentominoTilingsModal.vue";

type PentominoId =
  "f" | "l" | "i" | "p" | "n" | "t" | "u" | "v" | "w" | "x" | "y" | "z";

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
const facts: Record<PentominoId, string> = {
  f: "The F has a mirror twin: flip it and you get a different one-sided shape.",
  l: "The L is made from a four-square leg with one square branching from its end.",
  i: "The I is the only straight pentomino—five equal squares in one uninterrupted line.",
  p: "The P is a 2 × 2 square with one extra square attached, like a block with a tail.",
  n: "The N gets its character from two offset rows that make its ends step sideways.",
  t: "The T has a three-square bar and a two-square stem beneath its center.",
  u: "The U keeps a small three-sided pocket open between its two arms.",
  v: "The V is two three-square arms sharing one corner, making an open, chunky angle.",
  w: "The W moves one square over and one square down as it goes—a five-square staircase.",
  x: "The X has one unique orientation: turn or flip it and its silhouette stays the same.",
  y: "The Y is almost a line: four squares form the stem, with one square branching from the side.",
  z: "The Z winds through three rows to make a compact zig-zag.",
};

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);
const selectedPieceId = ref<PentominoId>("f");
const tilingsOpen = ref(false);
const buildOpen = ref(false);
const galleryOpen = ref(false);
const childReturnFocus = ref<HTMLElement | null>(null);
const selectedLabel = computed(
  () => pieceLabels[selectedPieceId.value] ?? "Pentomino",
);
const childOpen = computed(
  () => tilingsOpen.value || buildOpen.value || galleryOpen.value,
);

onMounted(() => {
  dialogRef.value?.focus();
});

function getOrientation(pieceId: PentominoId): GridPoint[] {
  const piece = pieceDefinitions.find((candidate) => candidate.id === pieceId);
  return piece ? (generateOrientations(piece)[0] ?? piece.cells) : [];
}

function getViewBox(pieceId: PentominoId): string {
  const cells = getOrientation(pieceId);
  const width = Math.max(...cells.map((cell) => cell.x), 0) + 1;
  const height = Math.max(...cells.map((cell) => cell.y), 0) + 1;
  const padding = 0.12;
  return `-${padding} -${padding} ${width + padding * 2} ${height + padding * 2}`;
}

function selectPiece(pieceId: PentominoId) {
  selectedPieceId.value = pieceId;
}

function rememberChildReturnFocus() {
  childReturnFocus.value =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
}

function restoreChildReturnFocus() {
  const returnFocus = childReturnFocus.value;
  childReturnFocus.value = null;
  void nextTick(() => {
    if (returnFocus?.isConnected) returnFocus.focus();
  });
}

function openTilings() {
  rememberChildReturnFocus();
  tilingsOpen.value = true;
}

function closeTilings() {
  tilingsOpen.value = false;
  restoreChildReturnFocus();
}

function openBuild() {
  rememberChildReturnFocus();
  buildOpen.value = true;
}

function closeBuild() {
  buildOpen.value = false;
  restoreChildReturnFocus();
}

function openGallery() {
  rememberChildReturnFocus();
  galleryOpen.value = true;
}

function closeGallery() {
  galleryOpen.value = false;
  restoreChildReturnFocus();
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
  <div class="facts-modal" @click.self="emit('close')">
    <section
      ref="dialogRef"
      class="facts-modal__panel"
      tabindex="-1"
      role="dialog"
      :aria-modal="childOpen ? undefined : 'true'"
      :aria-hidden="childOpen ? 'true' : undefined"
      :inert="childOpen"
      aria-labelledby="facts-modal-title"
      @keydown="trapFocus"
    >
      <header class="facts-modal__header">
        <div>
          <h2 id="facts-modal-title">Pentominoes</h2>
          <p class="facts-modal__intro">Five squares. Twelve shapes.</p>
        </div>
        <button
          class="facts-modal__close"
          type="button"
          aria-label="Close pentominoes"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div class="facts-modal__grid" aria-label="Pentomino pieces">
        <button
          v-for="pieceId in pentominoIds"
          :key="pieceId"
          class="facts-modal__piece"
          :class="{
            'facts-modal__piece--selected': selectedPieceId === pieceId,
          }"
          type="button"
          :aria-label="pieceLabels[pieceId]"
          :aria-pressed="selectedPieceId === pieceId"
          @click="selectPiece(pieceId)"
        >
          <svg
            class="facts-modal__piece-shape"
            :viewBox="getViewBox(pieceId)"
            aria-hidden="true"
          >
            <rect
              v-for="cell in getOrientation(pieceId)"
              :key="`${pieceId}-${cell.x}-${cell.y}`"
              :x="cell.x + 0.03"
              :y="cell.y + 0.03"
              width="0.94"
              height="0.94"
              rx="0.16"
              :fill="pieceColors[pieceId]"
            />
          </svg>
          <span class="facts-modal__piece-letter">{{
            pieceId.toUpperCase()
          }}</span>
        </button>
      </div>

      <div class="facts-modal__fact" aria-live="polite">
        <p class="facts-modal__fact-label">{{ selectedLabel }}</p>
        <p>{{ facts[selectedPieceId] }}</p>
      </div>

      <nav
        class="facts-modal__paths"
        aria-label="Explore pentomino constructions"
      >
        <button type="button" @click="openTilings">
          <span>Four rectangles</span><span aria-hidden="true">→</span>
        </button>
        <button type="button" @click="openGallery">
          <span>Nine to one</span><span aria-hidden="true">→</span>
        </button>
        <button type="button" @click="openBuild">
          <span>Build a shape</span><span aria-hidden="true">→</span>
        </button>
      </nav>
    </section>

    <PentominoTilingsModal v-if="tilingsOpen" @close="closeTilings" />
    <PentominoBuildModal v-if="buildOpen" @close="closeBuild" />
    <PentominoBuildGalleryModal v-if="galleryOpen" @close="closeGallery" />
  </div>
</template>
