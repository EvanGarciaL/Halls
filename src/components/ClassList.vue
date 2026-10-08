<script setup lang="ts">
  /**
   * ClassList — scrollable container that renders a ClassCard for each meeting.
   *
   * This component owns the "list" presentation concern that was previously
   * mixed into App.vue's template. It receives the filtered list as a prop
   * and renders it — nothing else.
   */
  import type { ClassMeeting } from '../domain/models'
  import ClassCard from './ClassCard.vue'

  defineProps<{
    classes: ClassMeeting[]
  }>()
</script>

<template>
  <div class="class-list">
    <div class="class-list__inner">
      <p v-if="classes.length === 0" class="class-list__empty">
        No classes in session.
      </p>
      <ClassCard
        v-for="meeting in classes"
        :key="meeting.key"
        v-bind="meeting"
      />
    </div>
  </div>
</template>

<style scoped>
  .class-list {
    height: 100dvh;
    width: 100%;
    align-items: center;
    justify-content: center;
    overflow-y: scroll;
  }

  .class-list__inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 2em;
  }

  .class-list__empty {
    color: #888;
    font-style: italic;
  }
</style>
