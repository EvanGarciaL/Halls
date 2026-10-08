<script setup lang="ts">
  /**
   * App.vue — layout shell.
   *
   * This is the only file that "wires" the composables to the components.
   * It has no business logic, no data fetching, and no filtering —
   * just composition.
   *
   * Compare this to the original 119-line App.vue that did everything.
   */
  import { useSchedule } from './composables/useSchedule'
  import { useFilters } from './composables/useFilters'

  import TimeFilter from './components/TimeFilter.vue'
  import DayFilter from './components/DayFilter.vue'
  import ClassList from './components/ClassList.vue'

  const { classes, isLoading, error } = useSchedule()
  const { daysSelected, timeInput, filteredClasses, toggleDay } = useFilters(classes)
</script>

<template>
  <div class="sidebar">
    <TimeFilter v-model:time="timeInput" />
    <DayFilter
      :selected="daysSelected"
      @toggle="toggleDay"
    />
  </div>

  <main class="content">
    <p v-if="isLoading" class="status">Loading schedule…</p>
    <p v-else-if="error" class="status status--error">{{ error }}</p>
    <ClassList v-else :classes="filteredClasses" />
  </main>
</template>

<style scoped>
  .sidebar {
    width: 100%;
    height: 100%;
    background-color: dimgray;
    align-content: center;
    text-align: center;
    position: relative;
    z-index: 1;
    box-shadow: 10px 0 20px rgba(0, 0, 0, 0.2);
  }

  .content {
    height: 100dvh;
    width: 100%;
  }

  .status {
    text-align: center;
    padding: 2em;
    color: #888;
  }

  .status--error {
    color: #c00;
  }
</style>
