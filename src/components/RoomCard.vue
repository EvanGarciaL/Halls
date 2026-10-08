<script setup lang="ts">
  /**
   * ClassCard — displays a single class meeting.
   *
   * Renamed from the generic "Data.vue". This component only knows how
   * to render a ClassMeeting; it has no filtering logic, no data fetching,
   * and no awareness of the rest of the app.
   */
  import type { ClassMeeting } from '../domain/models'
  import { TimeOfDay } from '../domain/time'

  const props = defineProps<ClassMeeting>()
</script>

<template>
  <div class="room-card">
    <span class="room-info">
      <p class="building">{{ building }}</p>
    </span>
    <span class="class-schedule">
      <p>{{ [...days].join('') }}</p>
      <p>
        {{ TimeOfDay.toAMPM(startTime.hour, startTime.minute) }}
        –
        {{ TimeOfDay.toAMPM(endTime.hour, endTime.minute) }}
      </p>
    </span>
  </div>
</template>

<style scoped>
  .class-card {
    display: flex;
    background-color: #f8f8f8;
    min-height: 4em;
    width: 80%;
    height: fit-content;
    position: relative;
    padding: 0 1em;
    margin-top: 1em;
    border: 1px solid red;
    border-radius: 4px;
  }

  .class-info {
    flex-grow: 1;
  }

  .class-schedule {
    flex-grow: 1;
    text-align: end;
  }

  p {
    font-size: 0.8rem;
  }
</style>
