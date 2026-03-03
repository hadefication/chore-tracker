<template>
  <div class="parent-approvals">
    <v-sheet class="app-surface parent-command pa-5 mb-5">
      <div class="parent-command-grid">
        <div>
          <div class="parent-kicker">Approval queue</div>
          <div class="parent-heading">Review submitted chores</div>
          <p class="parent-copy mb-0">
            Work the queue, approve what counts, reject what does not, and keep the month totals clean.
          </p>
        </div>
        <div class="parent-meter">
          <div class="parent-meter-label">Pending right now</div>
          <div class="parent-meter-value">{{ store.pendingSubmissions.length }}</div>
        </div>
      </div>

      <v-row class="mt-1">
        <v-col cols="12" md="4">
          <v-card class="parent-stat-card pa-4 h-100">
            <div class="text-overline">Approved points</div>
            <div class="text-h4 font-weight-black">{{ metrics.totalPoints }}</div>
            <div class="text-body-2 opacity-70 mt-2">{{ metrics.goalTarget }} point target</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="parent-stat-card pa-4 h-100">
            <div class="text-overline">Current streak</div>
            <div class="text-h4 font-weight-black">{{ metrics.currentStreak }} days</div>
            <div class="text-body-2 opacity-70 mt-2">{{ metrics.nextBonusIn }} days to next bonus</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="parent-stat-card pa-4 h-100 parent-stat-card-accent">
            <div class="text-overline">Reward + rejects</div>
            <div class="text-h6 font-weight-black text-wrap">{{ metrics.rewardGoal || 'Not set' }}</div>
            <div class="text-body-2 opacity-70 mt-2">{{ store.rejectedSubmissions.length }} rejected this month</div>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>

    <div class="parent-queue-wrap">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <div>
          <div class="parent-kicker">Pending submissions</div>
          <div class="text-h5 font-weight-bold">Approve or reject</div>
        </div>
      </div>

      <div v-if="store.pendingSubmissions.length" class="parent-queue-grid">
        <v-sheet v-for="entry in store.pendingSubmissions" :key="entry.id" class="app-surface parent-queue-card pa-4">
          <div class="d-flex align-start justify-space-between ga-3 mb-3">
            <div>
              <div class="parent-queue-title">{{ entry.choreName }}</div>
              <div class="parent-queue-meta">{{ formatLongDate(entry.date) }}</div>
              <div class="parent-queue-meta">Submitted {{ submittedLabel(entry.submittedAt) }}</div>
            </div>
            <div class="parent-points-badge">{{ entry.points }}</div>
          </div>

          <div class="d-flex ga-2 flex-wrap">
            <v-btn color="success" prepend-icon="mdi-check" variant="flat" @click="store.approveSubmission(entry.id)">
              Approve
            </v-btn>
            <v-btn color="error" prepend-icon="mdi-close" variant="outlined" @click="store.rejectSubmission(entry.id)">
              Reject
            </v-btn>
          </div>
        </v-sheet>
      </div>

      <v-alert v-else type="success" variant="tonal">
        No chores are waiting for approval right now.
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatLongDate } from '../lib/date'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const metrics = computed(() => store.currentMonthMetrics)

function submittedLabel(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
</script>
