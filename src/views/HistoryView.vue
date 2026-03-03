<template>
  <div class="parent-history">
    <v-sheet class="app-surface parent-command pa-5 mb-5">
      <div class="parent-command-grid">
        <div>
          <div class="parent-kicker">History</div>
          <div class="parent-heading">Approved month snapshots</div>
          <p class="parent-copy mb-0">
            Every card below is derived from approved submissions only, including streak bonuses and archived goals.
          </p>
        </div>
        <div class="parent-meter parent-meter-wide">
          <div class="parent-meter-label">Archived months</div>
          <div class="parent-meter-value">{{ store.historyEntries.length }}</div>
          <div class="parent-meter-subtitle">Best streak {{ bestStreak }} days</div>
        </div>
      </div>
    </v-sheet>

    <v-row v-if="store.historyEntries.length">
      <v-col v-for="entry in store.historyEntries" :key="entry.month" cols="12" md="6" xl="4">
        <v-card class="pa-5 h-100 app-surface parent-history-card">
          <div class="d-flex align-start justify-space-between ga-3 mb-4">
            <div>
              <div class="parent-kicker">{{ entry.month }}</div>
              <div class="text-h5 font-weight-bold">{{ formatMonthLabel(entry.month) }}</div>
            </div>
            <v-chip :color="entry.goalReached ? 'success' : 'warning'" variant="outlined">
              {{ entry.goalReached ? 'Goal reached' : 'Below goal' }}
            </v-chip>
          </div>

          <div class="parent-history-grid mb-4">
            <div class="parent-history-stat">
              <span>Total</span>
              <strong>{{ entry.totalPoints }}</strong>
            </div>
            <div class="parent-history-stat">
              <span>Target</span>
              <strong>{{ entry.goalTarget }}</strong>
            </div>
            <div class="parent-history-stat">
              <span>Bonus</span>
              <strong>{{ entry.bonusPoints }}</strong>
            </div>
            <div class="parent-history-stat">
              <span>Streak</span>
              <strong>{{ entry.longestStreak }}</strong>
            </div>
          </div>

          <div class="parent-history-note mb-4">
            <div class="text-overline">Reward goal</div>
            <div class="font-weight-bold">{{ entry.rewardGoal || 'No reward set' }}</div>
          </div>

          <v-btn block color="secondary" prepend-icon="mdi-arrow-right" variant="flat" @click="openMonth(entry.month)">
            Open month detail
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-else type="info" variant="tonal">
      No approved history yet. Once approved chores land in a past month, cards will show here.
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatMonthLabel } from '../lib/date'
import { useAppStore } from '../stores/app'

const router = useRouter()
const store = useAppStore()
const bestStreak = computed(() =>
  store.historyEntries.reduce((best, entry) => Math.max(best, entry.longestStreak), 0),
)

function openMonth(month: string): void {
  router.push({ path: '/parent/month', query: { month } })
}
</script>
