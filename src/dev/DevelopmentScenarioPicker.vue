<script setup lang="ts">
import { computed } from "vue";
import type { CalendarBoardKey } from "../data/puzzleCatalog";

const props = defineProps<{
  boardKey: CalendarBoardKey;
  dateKey: string;
}>();

const emit = defineEmits<{
  select: [boardKey: CalendarBoardKey, dateKey: string];
}>();

const scenarios = [
  {
    id: "friday-date-24",
    label: "Friday start · date 24",
    boardKey: "31-5",
    dateKey: "2026-07-24",
  },
  {
    id: "saturday-date-8",
    label: "Saturday start · date 8",
    boardKey: "31-6",
    dateKey: "2026-08-08",
  },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  boardKey: CalendarBoardKey;
  dateKey: string;
}>;

const activeScenarioId = computed(
  () =>
    scenarios.find(
      (scenario) =>
        scenario.boardKey === props.boardKey &&
        scenario.dateKey === props.dateKey,
    )?.id ?? "",
);

function selectScenario(event: Event) {
  const input = event.target;
  if (!(input instanceof HTMLSelectElement)) return;

  const scenario = scenarios.find((candidate) => candidate.id === input.value);
  if (scenario) emit("select", scenario.boardKey, scenario.dateKey);
}
</script>

<template>
  <label class="board-picker">
    <span>Test case</span>
    <select
      :value="activeScenarioId"
      aria-label="Choose development test case"
      @change="selectScenario"
    >
      <option value="" disabled>Choose a case</option>
      <option
        v-for="scenario in scenarios"
        :key="scenario.id"
        :value="scenario.id"
      >
        {{ scenario.label }}
      </option>
    </select>
  </label>
</template>
