<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type SettingsTab = "general" | "shortcuts";

const props = withDefaults(
  defineProps<{
    initialTab?: SettingsTab;
  }>(),
  {
    initialTab: "general",
  },
);

const emit = defineEmits<{ close: [] }>();
const dialogRef = ref<HTMLElement | null>(null);
const activeTab = ref<SettingsTab>(props.initialTab);
const isPhone = ref(
  typeof window !== "undefined" &&
    window.matchMedia("(max-width: 600px) and (pointer: coarse)").matches,
);
let phoneMediaQuery: MediaQueryList | undefined;
const showShortcutsTab = computed(
  () => !isPhone.value || activeTab.value === "shortcuts",
);
function updatePhoneMode() {
  isPhone.value = phoneMediaQuery?.matches ?? false;
}

onMounted(() => {
  dialogRef.value?.focus();
  phoneMediaQuery = window.matchMedia(
    "(max-width: 600px) and (pointer: coarse)",
  );
  phoneMediaQuery.addEventListener("change", updatePhoneMode);
});

onBeforeUnmount(() => {
  phoneMediaQuery?.removeEventListener("change", updatePhoneMode);
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
  <div class="settings-modal" @click.self="emit('close')">
    <section
      ref="dialogRef"
      class="settings-modal__panel"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      @keydown="trapFocus"
    >
      <header class="settings-modal__header">
        <h2 id="settings-modal-title">Settings</h2>
        <button
          class="settings-modal__close"
          type="button"
          aria-label="Close settings"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div
        v-if="showShortcutsTab"
        class="settings-modal__tabs"
        role="tablist"
        aria-label="Settings"
      >
        <button
          id="settings-tab-general"
          class="settings-modal__tab"
          :class="{ 'settings-modal__tab--active': activeTab === 'general' }"
          type="button"
          role="tab"
          aria-controls="settings-panel-general"
          :aria-selected="activeTab === 'general'"
          @click="activeTab = 'general'"
        >
          General
        </button>
        <button
          id="settings-tab-shortcuts"
          class="settings-modal__tab"
          :class="{ 'settings-modal__tab--active': activeTab === 'shortcuts' }"
          type="button"
          role="tab"
          aria-controls="settings-panel-shortcuts"
          :aria-selected="activeTab === 'shortcuts'"
          @click="activeTab = 'shortcuts'"
        >
          Keyboard shortcuts
        </button>
      </div>

      <div
        v-if="activeTab === 'general'"
        id="settings-panel-general"
        class="settings-modal__content"
        role="tabpanel"
        aria-labelledby="settings-tab-general"
        tabindex="0"
      >
        <h3>Game preferences</h3>
        <p>More settings will appear here as Daymark grows.</p>
      </div>

      <div
        v-else
        id="settings-panel-shortcuts"
        class="settings-modal__content"
        role="tabpanel"
        aria-labelledby="settings-tab-shortcuts"
        tabindex="0"
      >
        <p class="settings-modal__description">
          Use these shortcuts while arranging pieces.
        </p>

        <dl class="settings-modal__list">
          <div class="settings-modal__row">
            <dt><kbd>R</kbd> / <kbd>Shift + R</kbd></dt>
            <dd>Rotate selected piece right / left</dd>
          </div>
          <div class="settings-modal__row">
            <dt><kbd>H</kbd> / <kbd>V</kbd></dt>
            <dd>Flip selected piece horizontally / vertically</dd>
          </div>
          <div class="settings-modal__row">
            <dt>
              <span class="settings-modal__arrow-keys" aria-label="Arrow keys">
                <kbd aria-hidden="true">↑</kbd>
                <kbd aria-hidden="true">↓</kbd>
                <kbd aria-hidden="true">←</kbd>
                <kbd aria-hidden="true">→</kbd>
              </span>
            </dt>
            <dd>Move a focused placed piece one square into an open space</dd>
          </div>
          <div class="settings-modal__row">
            <dt><kbd>Enter</kbd> / <kbd>Space</kbd></dt>
            <dd>
              Select a focused piece, or place the selected piece on a focused
              cell
            </dd>
          </div>
          <div class="settings-modal__row">
            <dt><kbd>Cmd / Ctrl + /</kbd></dt>
            <dd>Show or hide these shortcuts</dd>
          </div>
        </dl>
      </div>
    </section>
  </div>
</template>
