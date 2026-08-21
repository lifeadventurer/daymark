<script setup lang="ts">
import { onMounted, ref } from "vue";
import { pieceColors } from "../data/pieces";
import { pentominoBuildGallery } from "../data/pentominoBuildGallery";
import type { GridPoint } from "../engine/types";

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);

onMounted(() => {
  dialogRef.value?.focus();
});

function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
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
</script>

<template>
  <div class="build-gallery-modal" @click.self="emit('close')">
    <section
      ref="dialogRef"
      class="build-gallery-modal__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="build-gallery-modal-title"
      @keydown="trapFocus"
    >
      <header class="build-gallery-modal__header">
        <div>
          <h2 id="build-gallery-modal-title">Nine to one</h2>
          <p class="build-gallery-modal__intro">
            Nine pieces, one larger pentomino.
          </p>
        </div>
        <button
          class="build-gallery-modal__close"
          type="button"
          aria-label="Close built shapes"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div
        class="build-gallery-modal__grid"
        aria-label="Built pentomino shapes"
      >
        <figure
          v-for="galleryItem in pentominoBuildGallery"
          :key="galleryItem.id"
          class="build-gallery-modal__figure"
        >
          <svg
            class="build-gallery-modal__svg"
            :viewBox="`-0.08 -0.08 ${galleryItem.width + 0.16} ${galleryItem.height + 0.16}`"
            role="img"
            :aria-label="`${galleryItem.targetPieceId.toUpperCase()} pentomino made from nine pieces`"
          >
            <g
              v-for="placement in galleryItem.placements"
              :key="placement.pieceId"
            >
              <rect
                v-for="cell in placement.cells"
                :key="`${placement.pieceId}-${pointKey(cell)}`"
                :x="cell.x + 0.035"
                :y="cell.y + 0.035"
                width="0.93"
                height="0.93"
                rx="0.12"
                :fill="pieceColors[placement.pieceId]"
              />
            </g>
          </svg>
        </figure>
      </div>
    </section>
  </div>
</template>
