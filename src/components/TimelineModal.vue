<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { BuildingHall, ClassMeeting, Day } from '../domain/models'
import type { TimeOfDay } from '../domain/time'

const props = defineProps<{
  hall: BuildingHall | null
  activeDays: Day[]
  currentTime: TimeOfDay
}>()

const emit = defineEmits<{
  close: []
}>()

/** Timeline bounds: 7:00 AM (420 mins) to 10:00 PM (1320 mins) = 900 total mins */
const TIMELINE_START_MIN = 7 * 60 // 420
const TIMELINE_END_MIN = 22 * 60 // 1320
const TOTAL_MINS = TIMELINE_END_MIN - TIMELINE_START_MIN // 900

const HOURS = [
  '7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM',
  '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM',
  '7 PM', '8 PM', '9 PM', '10 PM',
]

const DAY_LABELS: Record<Day, string> = {
  M: 'Monday (M)',
  Tu: 'Tuesday (Tu)',
  W: 'Wednesday (W)',
  Th: 'Thursday (Th)',
  F: 'Friday (F)',
}

// Current time indicator position on the timeline
const currentTimePercent = computed(() => {
  const currentMins = props.currentTime.toMinutes()
  if (currentMins < TIMELINE_START_MIN) return null
  if (currentMins > TIMELINE_END_MIN) return null
  return ((currentMins - TIMELINE_START_MIN) / TOTAL_MINS) * 100
})

/** Calculate block style for a meeting on the horizontal timeline */
function getMeetingStyle(meeting: ClassMeeting) {
  const start = meeting.startTime.toMinutes()
  const end = meeting.endTime.toMinutes()

  // Clamp to 7am - 10pm
  const clampStart = Math.max(TIMELINE_START_MIN, Math.min(TIMELINE_END_MIN, start))
  const clampEnd = Math.max(TIMELINE_START_MIN, Math.min(TIMELINE_END_MIN, end))

  const left = ((clampStart - TIMELINE_START_MIN) / TOTAL_MINS) * 100
  const width = Math.max(1, ((clampEnd - clampStart) / TOTAL_MINS) * 100)

  return {
    left: `${left}%`,
    width: `${width}%`,
  }
}

/** Get meetings for a specific day sorted chronologically */
function getMeetingsForDay(day: Day): ClassMeeting[] {
  if (!props.hall) return []
  return props.hall.meetings
    .filter(m => m.days.has(day))
    .sort((a, b) => a.startTime.toMinutes() - b.startTime.toMinutes())
}

function getBadgeClass(sectionType: string): string {
  const t = sectionType.toUpperCase()
  if (t === 'LEC') return 'badge--lec'
  if (t === 'DIS') return 'badge--dis'
  if (t === 'LAB') return 'badge--lab'
  if (t === 'SEM') return 'badge--sem'
  return 'badge--other'
}

// Handle ESC key to close modal
function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})

// Tooltip / popover detail
const selectedMeeting = ref<ClassMeeting | null>(null)
function showMeetingDetails(m: ClassMeeting) {
  selectedMeeting.value = selectedMeeting.value?.key === m.key ? null : m
}
</script>

<template>
  <div
    v-if="hall"
    class="modal-backdrop"
    @click.self="emit('close')"
  >
    <div class="modal-dialog" role="dialog" aria-modal="true">
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-left">
          <div class="hall-badge">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
              <path d="M9 22v-4h6v4" />
              <path d="M8 6h.01" />
              <path d="M16 6h.01" />
              <path d="M8 10h.01" />
              <path d="M16 10h.01" />
              <path d="M8 14h.01" />
              <path d="M16 14h.01" />
            </svg>
            <h2>{{ hall.building }}</h2>
          </div>
          <span class="hall-subtitle">
            Schedule Timeline (7:00 AM – 10:00 PM) · {{ hall.meetings.length }} Total Scheduled Meetings
          </span>
        </div>

        <button
          type="button"
          class="close-button"
          aria-label="Close timeline"
          @click="emit('close')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <!-- Selected Meeting Info Banner (if clicked) -->
      <div v-if="selectedMeeting" class="meeting-inspector">
        <div class="inspector-header">
          <span
            class="section-badge"
            :class="getBadgeClass(selectedMeeting.sectionType)"
          >
            {{ selectedMeeting.sectionType }}
          </span>
          <h4 class="inspector-title">{{ selectedMeeting.course }}</h4>
          <span class="inspector-time">
            {{ selectedMeeting.startTime.formatAMPM() }} – {{ selectedMeeting.endTime.formatAMPM() }}
          </span>
          <button
            class="inspector-close"
            @click="selectedMeeting = null"
          >
            ✕
          </button>
        </div>
        <div class="inspector-meta">
          <span v-if="selectedMeeting.department">
            <strong>Department:</strong> {{ selectedMeeting.department }}
          </span>
          <span v-if="selectedMeeting.school">
            <strong>School:</strong> {{ selectedMeeting.school }}
          </span>
          <span v-if="selectedMeeting.instructors?.length">
            <strong>Instructors:</strong> {{ selectedMeeting.instructors.join(', ') }}
          </span>
          <span v-if="selectedMeeting.sectionCode">
            <strong>Code:</strong> {{ selectedMeeting.sectionCode }}
          </span>
        </div>
      </div>

      <!-- Timeline Main View -->
      <div class="timeline-scroll-container">
        <div class="timeline-board">
          <!-- Hours Header Axis (X-axis) -->
          <div class="timeline-hours-header">
            <div class="day-col-header">Day</div>
            <div class="hours-track">
              <div
                v-for="(hourLabel, idx) in HOURS"
                :key="hourLabel"
                class="hour-mark"
                :style="{ left: `${(idx / (HOURS.length - 1)) * 100}%` }"
              >
                <span class="hour-label">{{ hourLabel }}</span>
                <span class="hour-tick"></span>
              </div>
            </div>
          </div>

          <!-- Day Rows -->
          <div class="timeline-rows">
            <div
              v-for="day in activeDays"
              :key="day"
              class="day-row"
            >
              <!-- Day Label Column -->
              <div class="day-label-cell">
                <span class="day-tag">{{ day }}</span>
                <span class="day-full-name">{{ DAY_LABELS[day] }}</span>
              </div>

              <!-- Day Track Area -->
              <div class="day-track">
                <!-- Grid background hour guide lines -->
                <div class="grid-lines">
                  <div
                    v-for="(h, idx) in HOURS"
                    :key="`grid-${idx}`"
                    class="grid-line"
                    :style="{ left: `${(idx / (HOURS.length - 1)) * 100}%` }"
                  ></div>
                </div>

                <!-- Red/Amber Current Filter Time Line -->
                <div
                  v-if="currentTimePercent !== null"
                  class="current-time-marker"
                  :style="{ left: `${currentTimePercent}%` }"
                >
                  <div class="marker-flag">
                    {{ currentTime.formatAMPM() }}
                  </div>
                </div>

                <!-- Class Meeting Blocks on this Day -->
                <div
                  v-for="m in getMeetingsForDay(day)"
                  :key="m.key"
                  class="meeting-block"
                  :class="[
                    getBadgeClass(m.sectionType),
                    { 'meeting-block--selected': selectedMeeting?.key === m.key },
                  ]"
                  :style="getMeetingStyle(m)"
                  :title="`${m.course} (${m.sectionType}) - ${m.startTime.formatAMPM()} to ${m.endTime.formatAMPM()}`"
                  role="button"
                  tabindex="0"
                  @click="showMeetingDetails(m)"
                >
                  <div class="block-content">
                    <span class="block-badge">{{ m.sectionType }}</span>
                    <span class="block-title">{{ m.course.split(' - ')[0] }}</span>
                  </div>
                  <span class="block-time">
                    {{ m.startTime.formatAMPM() }} – {{ m.endTime.formatAMPM() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer with Legend -->
      <div class="modal-footer">
        <div class="legend">
          <span class="legend-title">Legend:</span>
          <span class="legend-item">
            <span class="legend-dot badge--lec"></span> Lecture (Lec)
          </span>
          <span class="legend-item">
            <span class="legend-dot badge--dis"></span> Discussion (Dis)
          </span>
          <span class="legend-item">
            <span class="legend-dot badge--lab"></span> Lab
          </span>
          <span class="legend-item">
            <span class="legend-dot badge--sem"></span> Seminar
          </span>
          <span class="legend-item">
            <span class="legend-dot legend-dot--time"></span> Filter Time
          </span>
        </div>

        <button
          class="btn-done"
          @click="emit('close')"
        >
          Done
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
  background: rgba(10, 15, 26, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  width: 95vw;
  max-width: 1300px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(99, 102, 241, 0.15);
  overflow: hidden;
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from { transform: translateY(20px) scale(0.98); opacity: 0; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}

/* Modal Header */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(17, 24, 39, 0.6);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.hall-badge {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #818cf8;
}

.hall-badge h2 {
  margin: 0;
  font-size: 1.45rem;
  font-weight: 700;
  color: #f8fafc;
}

.hall-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
}

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #f8fafc;
  transform: rotate(90deg);
}

/* Inspector Banner */
.meeting-inspector {
  padding: 0.85rem 1.75rem;
  background: rgba(99, 102, 241, 0.1);
  border-bottom: 1px solid rgba(99, 102, 241, 0.2);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  animation: fadeIn 0.15s ease;
}

.inspector-header {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.inspector-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
}

.inspector-time {
  font-size: 0.85rem;
  color: #cbd5e1;
  font-variant-numeric: tabular-nums;
}

.inspector-close {
  margin-left: auto;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.inspector-close:hover {
  color: #fff;
}

.inspector-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.inspector-meta strong {
  color: #cbd5e1;
}

/* Timeline Scroll Container */
.timeline-scroll-container {
  flex: 1;
  overflow-x: auto;
  overflow-y: auto;
  padding: 1.25rem 1.75rem;
}

.timeline-board {
  min-width: 860px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Timeline Axis Header */
.timeline-hours-header {
  display: flex;
  align-items: flex-end;
  height: 38px;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.day-col-header {
  width: 140px;
  flex-shrink: 0;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}

.hours-track {
  flex: 1;
  position: relative;
  height: 100%;
}

.hour-mark {
  position: absolute;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hour-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}

.hour-tick {
  width: 1px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  margin-top: 4px;
}

/* Day Rows */
.timeline-rows {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.day-row {
  display: flex;
  align-items: center;
  height: 64px;
}

.day-label-cell {
  width: 140px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.day-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  font-weight: 700;
  font-size: 0.8rem;
}

.day-full-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: #cbd5e1;
  white-space: nowrap;
}

.day-track {
  flex: 1;
  height: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
}

/* Background grid lines */
.grid-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.04);
}

/* Current Time Marker */
.current-time-marker {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #f43f5e;
  box-shadow: 0 0 10px #f43f5e;
  z-index: 10;
  pointer-events: none;
}

.marker-flag {
  position: absolute;
  top: 2px;
  transform: translateX(-50%);
  background: #f43f5e;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 3px;
  white-space: nowrap;
  pointer-events: none;
}

/* Meeting Block */
.meeting-block {
  position: absolute;
  top: 6px;
  bottom: 6px;
  border-radius: 6px;
  padding: 0.3rem 0.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.meeting-block:hover {
  transform: scaleY(1.08);
  z-index: 8;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
}

.meeting-block--selected {
  outline: 2px solid #fff;
  z-index: 9;
}

.block-content {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  overflow: hidden;
  white-space: nowrap;
}

.block-badge {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 0.08rem 0.25rem;
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.3);
  text-transform: uppercase;
}

.block-title {
  font-size: 0.75rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.block-time {
  font-size: 0.65rem;
  opacity: 0.9;
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badge colors */
.badge--lec {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.85), rgba(30, 64, 175, 0.85));
  border: 1px solid rgba(147, 197, 253, 0.4);
  color: #eff6ff;
}

.badge--dis {
  background: linear-gradient(135deg, rgba(234, 88, 12, 0.85), rgba(194, 65, 12, 0.85));
  border: 1px solid rgba(253, 186, 116, 0.4);
  color: #fff7ed;
}

.badge--lab {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.85), rgba(4, 120, 87, 0.85));
  border: 1px solid rgba(110, 231, 183, 0.4);
  color: #f0fdf4;
}

.badge--sem {
  background: linear-gradient(135deg, rgba(147, 51, 234, 0.85), rgba(126, 34, 206, 0.85));
  border: 1px solid rgba(216, 180, 254, 0.4);
  color: #faf5ff;
}

.badge--other {
  background: linear-gradient(135deg, rgba(71, 85, 105, 0.85), rgba(51, 65, 85, 0.85));
  border: 1px solid rgba(203, 213, 225, 0.4);
  color: #f8fafc;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(17, 24, 39, 0.6);
  flex-wrap: wrap;
  gap: 1rem;
}

.legend {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: #94a3b8;
}

.legend-title {
  font-weight: 600;
  color: #cbd5e1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-dot--time {
  background: #f43f5e;
  border-radius: 50%;
  box-shadow: 0 0 6px #f43f5e;
}

.btn-done {
  padding: 0.45rem 1.25rem;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.btn-done:hover {
  background: #4338ca;
}
</style>
