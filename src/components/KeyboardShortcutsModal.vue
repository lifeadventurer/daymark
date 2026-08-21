<script setup lang="ts">
import { onMounted, ref } from "vue";

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);

onMounted(() => {
  dialogRef.value?.focus();
});

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
  <div class="shortcuts-modal" @click.self="emit('close')">
    <section
      ref="dialogRef"
      class="shortcuts-modal__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
      aria-describedby="shortcuts-modal-description"
      @keydown="trapFocus"
    >
      <header class="shortcuts-modal__header">
        <div>
          <h2 id="shortcuts-modal-title">Keyboard shortcuts</h2>
        </div>
        <button
          class="shortcuts-modal__close"
          type="button"
          aria-label="Close keyboard shortcuts"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <p id="shortcuts-modal-description" class="shortcuts-modal__description">
        Use these shortcuts while arranging pieces.
      </p>

      <dl class="shortcuts-modal__list">
        <div class="shortcuts-modal__row">
          <dt><kbd>R</kbd> / <kbd>Shift + R</kbd></dt>
          <dd>Rotate selected piece right / left</dd>
        </div>
        <div class="shortcuts-modal__row">
          <dt><kbd>H</kbd> / <kbd>V</kbd></dt>
          <dd>Flip selected piece horizontally / vertically</dd>
        </div>
        <div class="shortcuts-modal__row">
          <dt>
            <span class="shortcuts-modal__arrow-keys" aria-label="Arrow keys">
              <kbd aria-hidden="true">↑</kbd>
              <kbd aria-hidden="true">↓</kbd>
              <kbd aria-hidden="true">←</kbd>
              <kbd aria-hidden="true">→</kbd>
            </span>
          </dt>
          <dd>Move a focused placed piece one square into an open space</dd>
        </div>
        <div class="shortcuts-modal__row">
          <dt><kbd>Enter</kbd> / <kbd>Space</kbd></dt>
          <dd>
            Select a focused piece, or place the selected piece on a focused
            cell
          </dd>
        </div>
        <div class="shortcuts-modal__row">
          <dt><kbd>Cmd / Ctrl + /</kbd></dt>
          <dd>Show or hide these shortcuts</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
