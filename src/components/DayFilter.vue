<script setup lang="ts">
import type { Day } from '../domain/models'

defineProps<{
  selected: Set<Day>
}>()

const emit = defineEmits<{
  toggle: [day: Day]
}>()

const DAYS: { code: Day; label: string; tooltip: string }[] = [
  { code: 'M',  label: 'M',  tooltip: 'Monday' },
  { code: 'Tu', label: 'Tu', tooltip: 'Tuesday' },
  { code: 'W',  label: 'W',  tooltip: 'Wednesday' },
  { code: 'Th', label: 'Th', tooltip: 'Thursday' },
  { code: 'F',  label: 'F',  tooltip: 'Friday' },
]
</script>

<template>
  <div class="day-filter" role="group" aria-label="Filter by days of week">
    <button
      v-for="day in DAYS"
      :key="day.code"
      type="button"
      class="day-filter__btn"
      :class="{ 'day-filter__btn--active': selected.has(day.code) }"
      :title="day.tooltip"
      :aria-pressed="selected.has(day.code)"
      @click="emit('toggle', day.code)"
    >
      {{ day.label }}
    </button>
  </div>
</template>

<style scoped>
.day-filter {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.day-filter__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 0.4rem;
  border-radius: 7px;
  background: transparent;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.day-filter__btn:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.08);
}

.day-filter__btn--active {
  background: #4f46e5;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4);
}

.day-filter__btn--active:hover {
  background: #4338ca;
  color: #ffffff;
}
</style>
