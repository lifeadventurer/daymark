<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { generateOrientations } from "../engine/geometry";
import { pieceColors, pieceDefinitions, pieceLabels } from "../data/pieces";

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);

const facts = [
  {
    pieceId: "f",
    kicker: "A little rebellious",
    title: "The F has a mirror twin",
    copy: "Flip the F and you get a different one-sided shape. Rotating it cannot make the mirror image match.",
  },
  {
    pieceId: "l",
    kicker: "Long-legged",
    title: "Four in a line, one at the end",
    copy: "The L is made from a four-square leg with one square branching from its end.",
  },
  {
    pieceId: "i",
    kicker: "Straight to the point",
    title: "The only straight pentomino",
    copy: "The I is five equal squares in one uninterrupted line—the simplest silhouette in the set.",
  },
  {
    pieceId: "p",
    kicker: "Almost a square",
    title: "A block with a tail",
    copy: "The P is a 2 × 2 square with one extra square attached, like a tiny flag or a bubble with a handle.",
  },
  {
    pieceId: "n",
    kicker: "Offset by one",
    title: "The N leans into its name",
    copy: "Its two rows are shifted sideways, giving the N its characteristic step between the ends.",
  },
  {
    pieceId: "t",
    kicker: "A familiar silhouette",
    title: "The T has a strong crossbar",
    copy: "Three squares make the bar, while two more squares extend the stem beneath its center.",
  },
  {
    pieceId: "u",
    kicker: "Open on one side",
    title: "The U keeps a pocket open",
    copy: "Two arms and a base make a small three-sided pocket—useful for wrapping around other shapes.",
  },
  {
    pieceId: "v",
    kicker: "A growing corner",
    title: "The V is two arms sharing a corner",
    copy: "Each arm reaches three squares from the corner, making the V feel like an open, chunky angle.",
  },
  {
    pieceId: "w",
    kicker: "A small staircase",
    title: "The W climbs in three steps",
    copy: "The W moves one square over and one square down as it goes—a five-square staircase.",
  },
  {
    pieceId: "x",
    kicker: "The most centered one",
    title: "The X has one unique orientation",
    copy: "Turn or flip the X and its silhouette stays the same. It is the most symmetric member of the set.",
  },
  {
    pieceId: "y",
    kicker: "A branch off the stem",
    title: "The Y is almost a line",
    copy: "Four squares form the stem, with one square branching from the side near its end.",
  },
  {
    pieceId: "z",
    kicker: "A zig-zag in three rows",
    title: "The Z makes a winding path",
    copy: "Its squares turn through three rows, creating a compact zig-zag that is easy to recognize from any angle.",
  },
] as const;

const factIndex = ref(Math.floor(Math.random() * facts.length));
const currentFact = computed(() => facts[factIndex.value]);
const currentPiece = computed(() =>
  pieceDefinitions.find((piece) => piece.id === currentFact.value.pieceId),
);
const currentOrientation = computed(() => {
  const piece = currentPiece.value;
  return piece ? (generateOrientations(piece)[0] ?? piece.cells) : [];
});
const shapeViewBox = computed(() => {
  const width =
    Math.max(...currentOrientation.value.map((cell) => cell.x), 0) + 1;
  const height =
    Math.max(...currentOrientation.value.map((cell) => cell.y), 0) + 1;
  const padding = 0.12;
  return `-${padding} -${padding} ${width + padding * 2} ${height + padding * 2}`;
});
const currentColor = computed(
  () => pieceColors[currentFact.value.pieceId] ?? "#718277",
);
const currentLabel = computed(
  () => pieceLabels[currentFact.value.pieceId] ?? "Pentomino",
);

onMounted(() => {
  dialogRef.value?.focus();
});

function showAnotherFact() {
  let nextIndex = factIndex.value;
  while (nextIndex === factIndex.value) {
    nextIndex = Math.floor(Math.random() * facts.length);
  }
  factIndex.value = nextIndex;
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
      aria-modal="true"
      aria-labelledby="facts-modal-title"
      @keydown="trapFocus"
    >
      <header class="facts-modal__header">
        <div>
          <p class="facts-modal__eyebrow">Pentomino lore</p>
          <h2 id="facts-modal-title">Did you know?</h2>
        </div>
        <button
          class="facts-modal__close"
          type="button"
          aria-label="Close pentomino facts"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div class="facts-modal__story" aria-live="polite">
        <div class="facts-modal__shape-wrap">
          <svg
            class="facts-modal__shape"
            :viewBox="shapeViewBox"
            role="img"
            :aria-label="`${currentLabel} shape`"
          >
            <rect
              v-for="cell in currentOrientation"
              :key="`${currentFact.pieceId}-${cell.x}-${cell.y}`"
              :x="cell.x + 0.03"
              :y="cell.y + 0.03"
              width="0.94"
              height="0.94"
              rx="0.16"
              :fill="currentColor"
            />
          </svg>
          <span class="facts-modal__piece-label">{{ currentLabel }}</span>
        </div>

        <div class="facts-modal__copy">
          <p class="facts-modal__kicker">{{ currentFact.kicker }}</p>
          <h3>{{ currentFact.title }}</h3>
          <p>{{ currentFact.copy }}</p>
        </div>
      </div>

      <footer class="facts-modal__footer">
        <span class="facts-modal__count"
          >{{ factIndex + 1 }} / {{ facts.length }}</span
        >
        <button
          class="facts-modal__next"
          type="button"
          @click="showAnotherFact"
        >
          Another fact <span aria-hidden="true">→</span>
        </button>
      </footer>
    </section>
  </div>
</template>
