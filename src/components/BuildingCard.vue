<script setup lang="ts">
import { computed } from 'vue'
import type { BuildingHall, DayStatus } from '../domain/models'
import type { FilterMode } from '../composables/useFilters'

const props = defineProps<{
  hall: BuildingHall
  mode: FilterMode
  activeDaysCount: number
}>()

const emit = defineEmits<{
  select: [hall: BuildingHall]
}>()

/** Format section badge class / color */
function getBadgeClass(sectionType?: string): string {
  if (!sectionType) return 'badge--other'
  const type = sectionType.toUpperCase()
  if (type === 'LEC') return 'badge--lec'
  if (type === 'DIS') return 'badge--dis'
  if (type === 'LAB') return 'badge--lab'
  if (type === 'SEM') return 'badge--sem'
  return 'badge--other'
}

/** Check if hall has any active session among evaluated days */
const hasActiveSession = computed(() => {
  return props.hall.dayStatuses.some(s => s.isInSession)
})

/** Helper to format day status string */
function formatFreeRange(status: DayStatus): string {
  if (status.freeStart && status.freeEnd) {
    return `${status.freeStart.formatAMPM()} – ${status.freeEnd.formatAMPM()}`
  }
  return 'All day'
}
</script>

<template>
  <article
    class="building-card"
    :class="{
      'building-card--empty-mode': mode === 'empty',
      'building-card--in-session-mode': mode === 'in-session',
      'building-card--occupied': hasActiveSession,
      'building-card--vacant': !hasActiveSession,
    }"
    role="button"
    tabindex="0"
    @click="emit('select', hall)"
    @keydown.enter="emit('select', hall)"
    @keydown.space.prevent="emit('select', hall)"
  >
    <!-- Header: Hall name & Room status pill -->
    <div class="card-header">
      <div class="hall-identity">
        <div class="hall-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
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
        </div>
        <h3 class="hall-name">{{ hall.building }}</h3>
      </div>

      <div class="status-pill-container">
        <span
          v-if="mode === 'empty'"
          class="status-pill status-pill--free"
        >
          <span class="pulse-dot"></span>
          Vacant
        </span>
        <span
          v-else-if="hasActiveSession"
          class="status-pill status-pill--occupied"
        >
          <span class="pulse-dot pulse-dot--active"></span>
          In Session
        </span>
      </div>
    </div>

    <!-- Body Content: Conditional based on Mode & Number of Days -->
    <div class="card-body">
      <!-- MULTI-DAY BREAKDOWN (When more than 1 day selected or evaluated) -->
      <div v-if="hall.dayStatuses.length > 1" class="days-breakdown">
        <ul class="day-status-list">
          <li
            v-for="status in hall.dayStatuses"
            :key="status.day"
            class="day-status-item"
            :class="{ 'day-status-item--occupied': status.isInSession }"
          >
            <span class="day-badge">{{ status.day }}</span>
            <div class="day-desc">
              <!-- If class is in session on this day -->
              <template v-if="status.isInSession && status.meeting">
                <!-- If in empty mode, user requested: what class is using it at the moment -->
                <span class="occupied-text">
                  <span
                    class="section-badge"
                    :class="getBadgeClass(status.meeting.sectionType)"
                  >
                    {{ status.meeting.sectionType }}
                  </span>
                  <span class="course-inline">{{ status.meeting.course.split(' - ')[0] }}</span>
                  <span class="tag-in-session">in session</span>
                </span>
              </template>

              <!-- If room is free on this day -->
              <template v-else>
                <span class="free-text">
                  <span class="free-label">Free</span>
                  {{ formatFreeRange(status) }}
                </span>
              </template>
            </div>
          </li>
        </ul>
      </div>

      <!-- SINGLE DAY DISPLAY -->
      <div v-else-if="hall.dayStatuses.length === 1" class="single-day-status">
        <template v-if="mode === 'in-session'">
          <!-- In-session mode: show class name conditionally -->
          <div
            v-for="meeting in hall.currentMeetings"
            :key="meeting.key"
            class="meeting-details"
          >
            <div class="meeting-meta">
              <span
                class="section-badge"
                :class="getBadgeClass(meeting.sectionType)"
              >
                {{ meeting.sectionType }}
              </span>
              <span class="meeting-time">
                {{ meeting.startTime.formatAMPM() }} – {{ meeting.endTime.formatAMPM() }}
              </span>
            </div>
            <p class="course-name">{{ meeting.course }}</p>
            <p v-if="meeting.department" class="dept-name">
              {{ meeting.department }}
            </p>
          </div>
        </template>

        <template v-else>
          <!-- Empty mode: class name is hidden, focus on free window -->
          <div class="empty-window-details">
            <span class="day-pill">{{ hall.dayStatuses[0]?.day }}</span>
            <div class="window-time">
              <span class="label">Available Window</span>
              <span class="hours">
                {{ formatFreeRange(hall.dayStatuses[0]!) }}
              </span>
            </div>
          </div>
        </template>
      </div>

      <!-- Fallback when no meetings at all -->
      <div v-else class="empty-state-notice">
        <span>No classes scheduled on selected days</span>
      </div>
    </div>

    <!-- Card Footer with interactive hint -->
    <div class="card-footer">
      <span class="view-timeline-hint">
        <span>View Full Timeline (7AM–10PM)</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </span>
    </div>
  </article>
</template>

<style scoped>
.building-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(22, 27, 34, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 1.15rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
}

.building-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.building-card:hover {
  transform: translateY(-3px);
  border-color: rgba(99, 102, 241, 0.45);
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.5), 0 0 15px rgba(99, 102, 241, 0.15);
}

.building-card:hover::before {
  opacity: 1;
}

.building-card:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.hall-identity {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.hall-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  flex-shrink: 0;
}

.hall-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: -0.015em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status Pills */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.22rem 0.65rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.status-pill--free {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-pill--occupied {
  background: rgba(59, 130, 246, 0.14);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.25);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 6px currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}

/* Card Body */
.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
}

/* Days Breakdown List */
.days-breakdown {
  display: flex;
  flex-direction: column;
}

.day-status-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.day-status-item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.35rem 0.55rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.82rem;
}

.day-status-item--occupied {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.15);
}

.day-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 20px;
  padding: 0 0.3rem;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-size: 0.72rem;
  font-weight: 700;
  flex-shrink: 0;
}

.day-desc {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.free-text {
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.free-label {
  color: #34d399;
  font-weight: 600;
}

.occupied-text {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
}

.course-inline {
  color: #f1f5f9;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-in-session {
  font-size: 0.7rem;
  color: #60a5fa;
  font-style: italic;
  opacity: 0.85;
}

/* Section Badges */
.section-badge {
  display: inline-block;
  padding: 0.12rem 0.4rem;
  border-radius: 4px;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  flex-shrink: 0;
}

.badge--lec {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge--dis {
  background: rgba(249, 115, 22, 0.2);
  color: #fdba74;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.badge--lab {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge--sem {
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge--other {
  background: rgba(100, 116, 139, 0.2);
  color: #cbd5e1;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

/* Single Day Meeting Details */
.meeting-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.meeting-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meeting-time {
  font-size: 0.8rem;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.course-name {
  margin: 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: #f8fafc;
  line-height: 1.35;
}

.dept-name {
  margin: 0;
  font-size: 0.78rem;
  color: #64748b;
}

/* Single Day Empty Window */
.empty-window-details {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  background: rgba(16, 185, 129, 0.06);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.15);
}

.day-pill {
  padding: 0.25rem 0.5rem;
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
  font-weight: 700;
  font-size: 0.75rem;
  border-radius: 6px;
}

.window-time {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.window-time .label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #34d399;
  font-weight: 600;
}

.window-time .hours {
  font-size: 0.9rem;
  font-weight: 600;
  color: #f1f5f9;
  font-variant-numeric: tabular-nums;
}

.empty-state-notice {
  font-size: 0.82rem;
  color: #64748b;
  font-style: italic;
  padding: 0.5rem 0;
}

/* Card Footer */
.card-footer {
  margin-top: auto;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.view-timeline-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  font-weight: 500;
  color: #64748b;
  transition: color 0.2s ease;
}

.building-card:hover .view-timeline-hint {
  color: #a5b4fc;
}
</style>
