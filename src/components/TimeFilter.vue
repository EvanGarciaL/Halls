<script setup lang="ts">
/**
 * TimeFilter — time input with icon and 'Now' shortcut for selecting filter time.
 */
const time = defineModel<string>('time', { required: true })

const emit = defineEmits<{
  now: []
}>()
</script>

<template>
  <div class="time-filter-wrapper">
    <div class="time-input-container">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="clock-icon"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <input
        v-model="time"
        type="time"
        class="time-filter-input"
        aria-label="Filter time"
      />
    </div>
    <button
      type="button"
      class="btn-now"
      title="Reset time to right now"
      @click="emit('now')"
    >
      Now
    </button>
  </div>
</template>

<style scoped>
.time-filter-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.time-input-container {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.25rem 0.65rem;
  transition: all 0.2s ease;
}

.time-input-container:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.clock-icon {
  color: #818cf8;
  flex-shrink: 0;
}

.time-filter-input {
  background: transparent;
  border: none;
  color: #f1f5f9;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  outline: none;
  cursor: pointer;
  color-scheme: dark;
}

.time-filter-input::-webkit-calendar-picker-indicator {
  filter: invert(0.8);
  cursor: pointer;
}

.btn-now {
  padding: 0.35rem 0.6rem;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-now:hover {
  background: rgba(99, 102, 241, 0.25);
  color: #ffffff;
}
</style>
