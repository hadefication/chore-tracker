<template>
  <div>
    <v-sheet class="app-surface pa-5 mb-5">
      <div class="text-overline">History</div>
      <div class="text-h4 font-weight-bold mb-2">Approved month snapshots</div>
      <p class="text-body-1 opacity-80 mb-0">
        History is built from approved chores only.
      </p>
    </v-sheet>

    <v-row v-if="store.historyEntries.length">
      <v-col v-for="entry in store.historyEntries" :key="entry.month" cols="12" md="6" xl="4">
        <v-card class="pa-5 h-100 app-surface">
          <div class="d-flex align-start justify-space-between ga-3 mb-4">
            <div>
              <div class="text-overline">{{ entry.month }}</div>
              <div class="text-h5 font-weight-bold">{{ formatMonthLabel(entry.month) }}</div>
            </div>
            <v-chip :color="entry.goalReached ? 'success' : 'warning'" variant="tonal">
              {{ entry.goalReached ? 'Goal reached' : 'In progress' }}
            </v-chip>
          </div>

          <v-list bg-color="transparent">
            <v-list-item prepend-icon="mdi-star-circle-outline" title="Total points" :subtitle="`${entry.totalPoints} points`" />
            <v-list-item prepend-icon="mdi-fire" title="Longest streak" :subtitle="`${entry.longestStreak} days`" />
            <v-list-item prepend-icon="mdi-gift-outline" title="Reward goal" :subtitle="entry.rewardGoal || 'No reward set'" />
          </v-list>

          <v-btn block class="mt-4" color="secondary" prepend-icon="mdi-arrow-right" @click="openMonth(entry.month)">
            Open month
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
import { useRouter } from 'vue-router'
import { formatMonthLabel } from '../lib/date'
import { useAppStore } from '../stores/app'

const router = useRouter()
const store = useAppStore()

function openMonth(month: string): void {
  router.push({ path: '/parent/month', query: { month } })
}
</script>
