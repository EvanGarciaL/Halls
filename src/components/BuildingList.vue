<script setup lang="ts">
import type { BuildingHall } from '../domain/models'
import type { FilterMode } from '../composables/useFilters'
import BuildingCard from './BuildingCard.vue'

defineProps<{
  halls: BuildingHall[]
  mode: FilterMode
  activeDaysCount: number
}>()

const emit = defineEmits<{
  select: [hall: BuildingHall]
}>()
</script>

<template>
  <div class="building-list-container">
    <!-- Grid of Building Cards -->
    <div v-if="halls.length > 0" class="building-grid">
      <BuildingCard
        v-for="hall in halls"
        :key="hall.building"
        :hall="hall"
        :mode="mode"
        :active-days-count="activeDaysCount"
        @select="emit('select', hall)"
      />
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state__icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h3 class="empty-state__title">
        {{ mode === 'in-session' ? 'No Classes in Session' : 'No Vacant Halls Found' }}
      </h3>
      <p class="empty-state__subtitle">
        {{
          mode === 'in-session'
            ? 'No lecture or discussion sessions match your current day and time filters.'
            : 'All lecture halls are occupied or have no open intervals at this time on the selected days.'
        }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.building-list-container {
  width: 100%;
  padding: 1.5rem 2rem 3rem;
  box-sizing: border-box;
}

/* Responsive Grid: 3-4 cols desktop, 2 tablet, 1 mobile */
.building-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  width: 100%;
}

@media (min-width: 1440px) {
  .building-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) and (max-width: 1439px) {
  .building-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 640px) and (max-width: 1023px) {
  .building-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 639px) {
  .building-grid {
    grid-template-columns: 1fr;
  }
  .building-list-container {
    padding: 1rem 1rem 2rem;
  }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 5rem 1.5rem;
  background: rgba(22, 27, 34, 0.4);
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.1);
  margin-top: 1rem;
}

.empty-state__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.04);
  color: #64748b;
  margin-bottom: 1.25rem;
}

.empty-state__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #e2e8f0;
}

.empty-state__subtitle {
  margin: 0;
  font-size: 0.95rem;
  color: #94a3b8;
  max-width: 440px;
  line-height: 1.5;
}
</style>
