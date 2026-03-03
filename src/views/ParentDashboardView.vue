<template>
  <div class="parent-dashboard">
    <v-sheet class="app-surface parent-command parent-dashboard-hero pa-5 mb-5">
      <div class="parent-command-grid">
        <div>
          <div class="parent-kicker">Parent dashboard</div>
          <div class="parent-heading">Run the month from one screen</div>
          <p class="parent-copy mb-0">
            Check the queue, confirm progress, and jump straight into whatever needs attention.
          </p>
        </div>
        <div class="parent-meter parent-meter-wide">
          <div class="parent-meter-label">Points to goal</div>
          <div class="parent-meter-value">{{ pointsToGoal }}</div>
          <div class="parent-meter-subtitle">{{ metrics.totalPoints }} of {{ metrics.goalTarget }} approved</div>
        </div>
      </div>

      <v-row class="mt-5">
        <v-col cols="12" sm="6" xl="3">
          <v-card class="parent-stat-card pa-4 h-100 parent-stat-card-alert">
            <div class="text-overline">Pending queue</div>
            <div class="text-h4 font-weight-black">{{ store.pendingSubmissions.length }}</div>
            <div class="text-body-2 opacity-70 mt-2">Needs review right now</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <v-card class="parent-stat-card pa-4 h-100">
            <div class="text-overline">Current streak</div>
            <div class="text-h4 font-weight-black">{{ metrics.currentStreak }} days</div>
            <div class="text-body-2 opacity-70 mt-2">Longest this month: {{ metrics.longestStreak }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <v-card class="parent-stat-card pa-4 h-100">
            <div class="text-overline">Recent approvals</div>
            <div class="text-h4 font-weight-black">{{ recentApproved.length }}</div>
            <div class="text-body-2 opacity-70 mt-2">Latest approved submissions</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6" xl="3">
          <v-card class="parent-stat-card pa-4 h-100 parent-stat-card-accent">
            <div class="text-overline">Reward focus</div>
            <div class="text-h6 font-weight-black text-wrap">{{ metrics.rewardGoal || 'Not set' }}</div>
            <div class="text-body-2 opacity-70 mt-2">{{ store.rejectedSubmissions.length }} rejected overall</div>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>

    <v-row class="mb-2">
      <v-col cols="12" xl="4">
        <v-sheet class="app-surface parent-shortcuts pa-5 h-100">
          <div class="parent-kicker mb-2">Quick actions</div>
          <div class="text-h5 font-weight-bold mb-4">Go where the work is</div>
          <div class="parent-shortcut-grid">
            <button
              v-for="shortcut in shortcuts"
              :key="shortcut.to"
              type="button"
              class="parent-shortcut-card"
              @click="router.push(shortcut.to)"
            >
              <div class="parent-shortcut-head">
                <v-icon :icon="shortcut.icon" size="22" />
                <span>{{ shortcut.title }}</span>
              </div>
              <div class="parent-shortcut-copy">{{ shortcut.copy }}</div>
            </button>
          </div>
        </v-sheet>
      </v-col>

      <v-col cols="12" xl="4">
        <v-sheet class="app-surface parent-feed pa-5 h-100">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div>
              <div class="parent-kicker">Recent approvals</div>
              <div class="text-h5 font-weight-bold">What counted</div>
            </div>
            <v-chip color="success" variant="outlined">{{ recentApproved.length }} latest</v-chip>
          </div>

          <div v-if="recentApproved.length" class="parent-feed-stack">
            <div v-for="entry in recentApproved" :key="entry.id" class="parent-feed-row success-row">
              <div class="parent-feed-score">{{ entry.points }}</div>
              <div class="flex-grow-1">
                <div class="font-weight-bold">{{ entry.choreName }}</div>
                <div class="parent-feed-meta">{{ formatShortDate(entry.date) }} · approved {{ reviewedLabel(entry.reviewedAt) }}</div>
              </div>
            </div>
          </div>

          <v-alert v-else type="info" variant="tonal">No approved submissions yet.</v-alert>
        </v-sheet>
      </v-col>

      <v-col cols="12" xl="4">
        <v-sheet class="app-surface parent-feed pa-5 h-100">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div>
              <div class="parent-kicker">Recent rejections</div>
              <div class="text-h5 font-weight-bold">What was denied</div>
            </div>
            <v-chip color="error" variant="outlined">{{ recentRejected.length }} latest</v-chip>
          </div>

          <div v-if="recentRejected.length" class="parent-feed-stack">
            <div v-for="entry in recentRejected" :key="entry.id" class="parent-feed-row reject-row">
              <div class="parent-feed-score">{{ entry.points }}</div>
              <div class="flex-grow-1">
                <div class="font-weight-bold">{{ entry.choreName }}</div>
                <div class="parent-feed-meta">{{ formatShortDate(entry.date) }} · rejected {{ reviewedLabel(entry.reviewedAt) }}</div>
              </div>
            </div>
          </div>

          <v-alert v-else type="success" variant="tonal">No recent rejections.</v-alert>
        </v-sheet>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatShortDate } from '../lib/date'
import { useAppStore } from '../stores/app'

const router = useRouter()
const store = useAppStore()
const metrics = computed(() => store.currentMonthMetrics)
const pointsToGoal = computed(() => Math.max(metrics.value.goalTarget - metrics.value.totalPoints, 0))
const recentApproved = computed(() => store.approvedSubmissions.slice(0, 5))
const recentRejected = computed(() => store.rejectedSubmissions.slice(0, 5))
const shortcuts = [
  { to: '/parent/approvals', icon: 'mdi-check-decagram-outline', title: 'Approvals', copy: 'Review the pending queue and clear blockers.' },
  { to: '/parent/library', icon: 'mdi-shape-outline', title: 'Library', copy: 'Add or tune chores and point values.' },
  { to: '/parent/history', icon: 'mdi-history', title: 'History', copy: 'Review archived monthly performance.' },
  { to: '/parent/settings', icon: 'mdi-cog-outline', title: 'Settings', copy: 'Adjust goals, streak rules, and the PIN.' },
] as const

function reviewedLabel(timestamp: string | null): string {
  if (!timestamp) {
    return 'just now'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}
</script>
