<script setup lang="ts">
import { onMounted, ref } from "vue";
import { pieceColors } from "../data/pieces";
import { pentominoTilings } from "../data/pentominoTilings";

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);
const tilings = pentominoTilings;

onMounted(() => {
  dialogRef.value?.focus();
});

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
          <h2 id="tilings-modal-title">Four rectangles</h2>
          <p class="tilings-modal__intro">
            The same twelve pieces can fill each shape.
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
