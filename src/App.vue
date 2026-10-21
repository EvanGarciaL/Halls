<script setup lang="ts">
/**
 * App.vue — main vertical layout shell.
 *
 * Houses the top navbar with filters and mode toggle,
 * the responsive grid of building lecture halls below,
 * and the 7AM–10PM timeline modal on hall selection.
 */
import { ref } from 'vue'
import { useSchedule } from './composables/useSchedule'
import { useFilters } from './composables/useFilters'
import type { BuildingHall } from './domain/models'

import TimeFilter from './components/TimeFilter.vue'
import DayFilter from './components/DayFilter.vue'
import BuildingList from './components/BuildingList.vue'
import TimelineModal from './components/TimelineModal.vue'

const { classes, isLoading, error, refresh } = useSchedule()
const {
  daysSelected,
  timeSelected,
  timeInput,
  mode,
  searchQuery,
  activeDays,
  filteredHalls,
  toggleDay,
  resetTimeToNow,
} = useFilters(classes)

/** Currently inspected hall for the timeline modal */
const selectedHall = ref<BuildingHall | null>(null)

function openTimeline(hall: BuildingHall) {
  selectedHall.value = hall
}

function closeTimeline() {
  selectedHall.value = null
}
</script>

<template>
  <div class="app-layout">
    <!-- TOP NAVBAR: Branding & Controls -->
    <header class="top-navbar">
      <div class="navbar-content">
        <!-- Brand identity -->
        <div class="brand">
          <div class="brand-logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
              <path d="M9 7h1" />
              <path d="M9 11h1" />
              <path d="M9 15h1" />
              <path d="M14 7h1" />
              <path d="M14 11h1" />
              <path d="M14 15h1" />
            </svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">UCI Halls</span>
            <span class="brand-quarter">Anteater Space Finder</span>
          </div>
        </div>

        <!-- Filter Controls Container -->
        <div class="navbar-controls">
          <!-- Mode Toggle Switch (In Session ↔ Empty) -->
          <div class="mode-toggle-group" role="radiogroup" aria-label="Hall Occupancy Mode">
            <button
              type="button"
              class="mode-btn"
              :class="{ 'mode-btn--active': mode === 'in-session' }"
              role="radio"
              :aria-checked="mode === 'in-session'"
              @click="mode = 'in-session'"
            >
              <span class="dot-indicator dot--session"></span>
              In Session
            </button>
            <button
              type="button"
              class="mode-btn"
              :class="{ 'mode-btn--active': mode === 'empty' }"
              role="radio"
              :aria-checked="mode === 'empty'"
              @click="mode = 'empty'"
            >
              <span class="dot-indicator dot--empty"></span>
              Vacant / Empty
            </button>
          </div>

          <!-- Time Filter Component -->
          <TimeFilter
            v-model:time="timeInput"
            @now="resetTimeToNow"
          />

          <!-- Day Filter Component -->
          <DayFilter
            :selected="daysSelected"
            @toggle="toggleDay"
          />

          <!-- Search Filter -->
          <div class="search-box">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="search-icon"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search hall or course…"
              class="search-input"
            />
            <button
              v-if="searchQuery"
              class="search-clear"
              @click="searchQuery = ''"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Results Counter Badge -->
        <div class="halls-count-badge">
          <span class="count-num">{{ filteredHalls.length }}</span>
          <span class="count-label">{{ mode === 'empty' ? 'Vacant' : 'Active' }}</span>
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT SECTION: Lower grid -->
    <main class="content-section">
      <!-- Loading State -->
      <div v-if="isLoading" class="status-container">
        <div class="loading-spinner"></div>
        <p class="status-text">Fetching current lecture &amp; discussion schedule…</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="status-container status-container--error">
        <div class="error-icon">⚠️</div>
        <p class="error-message">{{ error }}</p>
        <button class="retry-btn" @click="refresh">Try Again</button>
      </div>

      <!-- Building Halls Grid List -->
      <BuildingList
        v-else
        :halls="filteredHalls"
        :mode="mode"
        :active-days-count="activeDays.length"
        @select="openTimeline"
      />
    </main>

    <!-- 7AM–10PM Horizontal Timeline Modal -->
    <TimelineModal
      v-if="selectedHall"
      :hall="selectedHall"
      :active-days="activeDays"
      :current-time="timeSelected"
      @close="closeTimeline"
    />
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 50% 0%, #151d30 0%, #0a0f1d 70%);
}

/* TOP NAVBAR */
.top-navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(13, 19, 33, 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.5rem;
  gap: 1.25rem;
  flex-wrap: wrap;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex-shrink: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4f46e5, #06b6d4);
  color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(79, 70, 229, 0.35);
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f8fafc;
}

.brand-quarter {
  font-size: 0.7rem;
  font-weight: 500;
  color: #818cf8;
}

/* Controls */
.navbar-controls {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  flex-wrap: wrap;
}

/* Mode Toggle Group */
.mode-toggle-group {
  display: inline-flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.22rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.75rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.mode-btn:hover {
  color: #f1f5f9;
}

.mode-btn--active {
  background: #1e293b;
  color: #f8fafc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dot-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.dot--session {
  background: #3b82f6;
  box-shadow: 0 0 6px #3b82f6;
}

.dot--empty {
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
}

/* Search Box */
.search-box {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 0.3rem 0.65rem;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.search-icon {
  color: #64748b;
  flex-shrink: 0;
}

.search-input {
  background: transparent;
  border: none;
  color: #f8fafc;
  font-size: 0.82rem;
  outline: none;
  width: 140px;
  font-family: inherit;
}

.search-input::placeholder {
  color: #64748b;
}

.search-clear {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0 0.2rem;
}

.search-clear:hover {
  color: #fff;
}

/* Halls Count Badge */
.halls-count-badge {
  display: flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.35rem 0.8rem;
  background: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-radius: 10px;
  flex-shrink: 0;
}

.count-num {
  font-size: 1.05rem;
  font-weight: 800;
  color: #818cf8;
}

.count-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* MAIN CONTENT */
.content-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Status & Loading */
.status-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem;
  gap: 1.25rem;
}

.loading-spinner {
  width: 44px;
  height: 44px;
  border: 3px solid rgba(99, 102, 241, 0.15);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-text {
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0;
}

.status-container--error {
  color: #f87171;
}

.error-icon {
  font-size: 2rem;
}

.error-message {
  font-size: 1rem;
  color: #fca5a5;
  margin: 0;
  max-width: 400px;
  text-align: center;
}

.retry-btn {
  padding: 0.5rem 1.25rem;
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:hover {
  background: rgba(239, 68, 68, 0.25);
  color: #ffffff;
}
</style>
