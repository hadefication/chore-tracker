<template>
  <div v-if="cycles.length" class="trophy-shelf">
    <div class="d-flex align-center justify-space-between mb-4">
      <div>
        <div class="text-overline">Trophy shelf</div>
        <div class="text-h5 font-weight-bold">{{ cycles.length }} win{{ cycles.length === 1 ? '' : 's' }}</div>
      </div>
      <v-icon color="amber-darken-1" icon="mdi-trophy" size="32" />
    </div>

    <div class="trophy-grid">
      <v-card
        v-for="(cycle, index) in cycles"
        :key="cycle.id"
        :class="['trophy-card pa-4', { 'trophy-featured': index === 0 }]"
      >
        <div class="d-flex align-center ga-3 mb-2">
          <v-icon :color="badgeColor(cycle.badge)" :icon="badgeIcon(cycle.badge)" :size="index === 0 ? 36 : 28" />
          <div>
            <div class="font-weight-bold" :class="index === 0 ? 'text-h6' : 'text-body-1'">
              {{ cycle.rewardGoal }}
            </div>
            <div class="text-body-2 opacity-70">{{ badgeLabel(cycle.badge) }}</div>
          </div>
        </div>
        <div class="d-flex flex-wrap ga-2">
          <v-chip size="small" variant="outlined">
            {{ getEarnedPoints(cycle) + cycle.startingPoints }} pts
          </v-chip>
          <v-chip size="small" variant="outlined">
            {{ formatDate(cycle.completedAt!) }}
          </v-chip>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BadgeTier, GoalCycle } from '../types/domain'

defineProps<{
  cycles: GoalCycle[]
  getEarnedPoints: (cycle: GoalCycle) => number
}>()

const badgeConfig: Record<BadgeTier, { color: string; icon: string; label: string }> = {
  'perfect-month': { color: 'amber-darken-1', icon: 'mdi-star-circle', label: 'Perfect Month' },
  'speed-run': { color: 'blue-grey-lighten-1', icon: 'mdi-lightning-bolt-circle', label: 'Speed Run' },
  standard: { color: 'deep-orange-lighten-1', icon: 'mdi-check-decagram', label: 'Goal Complete' },
}

function badgeColor(badge: BadgeTier | null): string {
  return badgeConfig[badge ?? 'standard'].color
}

function badgeIcon(badge: BadgeTier | null): string {
  return badgeConfig[badge ?? 'standard'].icon
}

function badgeLabel(badge: BadgeTier | null): string {
  return badgeConfig[badge ?? 'standard'].label
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}
</script>

<style scoped>
.trophy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
}

.trophy-featured {
  grid-column: 1 / -1;
}

.trophy-card {
  border-left: 4px solid rgb(var(--v-theme-surface-variant));
}

.trophy-featured {
  border-left-color: rgb(var(--v-theme-primary));
}
</style>
