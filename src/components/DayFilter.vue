<script setup lang="ts">
  /**
   * DayFilter — checkbox group for selecting which days to filter by.
   *
   * Extracted from App.vue's inline checkboxes. The original bound
   * v-model to a Set, which doesn't work correctly with checkboxes
   * (Vue's v-model on checkboxes produces arrays, not Sets).
   *
   * Instead, we use @change + a toggleDay callback, which is explicit
   * and always correct.
   */
  import type { Day } from '../domain/models'

  const props = defineProps<{
    selected: Set<Day>
  }>()

  const emit = defineEmits<{
    toggle: [day: Day]
  }>()

  const DAYS: { code: Day; label: string }[] = [
    { code: 'M',  label: 'M' },
    { code: 'Tu', label: 'Tu' },
    { code: 'W',  label: 'W' },
    { code: 'Th', label: 'Th' },
    { code: 'F',  label: 'F' },
  ]
</script>

<template>
  <div class="day-filter">
    <label
      v-for="day in DAYS"
      :key="day.code"
      class="day-filter__option"
    >
      <input
        type="checkbox"
        :checked="selected.has(day.code)"
        @change="$emit('toggle', day.code)"
      />
      {{ day.label }}
    </label>
  </div>
</template>

<style scoped>
  .day-filter {
    display: flex;
    gap: 0.5em;
    justify-content: center;
  }

  .day-filter__option {
    cursor: pointer;
  }
</style>
