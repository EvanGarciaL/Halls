<script setup lang="ts">
  /**
   * TimeFilter — time input for selecting which time to filter by.
   *
   * Accepts a v-model:time string in "HH:MM" format, which is what
   * HTML <input type="time"> natively produces and consumes.
   */
  const time = defineModel<string>('time', { required: true })
</script>

<template>
  <input type="time" class="time-filter" v-model="time" />
</template>

<style scoped>
  .time-filter {
    font-size: 1rem;
  }
</style>
