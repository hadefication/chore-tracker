<template>
  <div class="child-dashboard">
    <v-row class="mb-2" align="stretch">
      <v-col cols="12" xl="8">
        <v-sheet class="app-surface child-hero pa-6 pa-md-8 h-100">
          <div class="child-burst" aria-hidden="true" />
          <div class="d-flex flex-wrap align-start justify-space-between ga-4 mb-6 child-hero-copy">
            <div class="child-copy-block">
              <div class="child-month-pill">{{ monthLabel }}</div>
              <h1 class="child-title">{{ headline }}</h1>
              <p class="child-subtitle">
                Finish a chore, send it in, and wait for a parent thumbs-up before the points count. If it is not in the
                library yet, propose it.
              </p>
              <div class="d-flex flex-wrap ga-3 mt-5">
                <v-btn color="primary" prepend-icon="mdi-rocket-launch-outline" @click="dialogOpen = true">
                  Log Completed Chore
                </v-btn>
                <v-chip class="child-reward-chip" color="accent" prepend-icon="mdi-gift-outline" size="large" variant="outlined">
                  {{ rewardGoalLabel }}
                </v-chip>
              </div>
            </div>

            <div class="child-medallion-wrap">
              <div class="child-medallion">
                <v-progress-circular
                  :model-value="progressValue"
                  :rotate="-90"
                  :size="210"
                  :width="18"
                  color="primary"
                >
                  <div class="text-center">
                    <div class="text-overline">Approved</div>
                    <div class="text-h3 font-weight-black">{{ metrics.totalPoints }}</div>
                    <div class="text-body-2">of {{ metrics.goalTarget }}</div>
                  </div>
                </v-progress-circular>
              </div>
            </div>
          </div>

          <v-row>
            <v-col cols="12" md="4">
              <v-card class="child-stat-card h-100 pa-4">
                <div class="text-overline">Current streak</div>
                <div class="text-h4 font-weight-black mt-1">{{ metrics.currentStreak }} days</div>
                <div class="text-body-2 mt-2 opacity-80">
                  Next streak bonus in {{ metrics.nextBonusIn }} day{{ metrics.nextBonusIn === 1 ? '' : 's' }}.
                </div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="child-stat-card h-100 pa-4 child-stat-card-warm">
                <div class="text-overline">Waiting on parent</div>
                <div class="text-h4 font-weight-black mt-1">{{ store.currentMonthPendingSubmissions.length }}</div>
                <div class="text-body-2 mt-2 opacity-80">Pending submissions this month.</div>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="child-stat-card h-100 pa-4 child-stat-card-cool">
                <div class="text-overline">Points to goal</div>
                <div class="text-h4 font-weight-black mt-1">{{ pointsToGoal }}</div>
                <div class="text-body-2 mt-2 opacity-80">{{ pointsToGoalCopy }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-sheet>
      </v-col>

      <v-col cols="12" xl="4">
        <v-sheet class="app-surface child-side-panel pa-5 h-100">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <div class="text-overline">Today's status</div>
              <div class="text-h5 font-weight-bold">Keep the streak alive</div>
            </div>
            <v-icon color="secondary" icon="mdi-fire-circle" size="34" />
          </div>

          <div class="child-status-stack mb-4">
            <div class="child-status-row">
              <span>Approved today</span>
              <strong>{{ store.todayApprovedSubmissions.length }}</strong>
            </div>
            <div class="child-status-row">
              <span>Pending today</span>
              <strong>{{ store.todayPendingSubmissions.length }}</strong>
            </div>
            <div class="child-status-row">
              <span>Library chores</span>
              <strong>{{ store.chores.length }}</strong>
            </div>
          </div>

          <div class="text-overline mb-2">Quick picks</div>
          <div class="child-quick-grid mb-5">
            <button
              v-for="chore in quickChores"
              :key="chore.id"
              class="child-quick-card"
              type="button"
              @click="dialogOpen = true"
            >
              <span class="child-quick-name">{{ chore.name }}</span>
              <span class="child-quick-points">{{ chore.defaultPoints }} pts</span>
            </button>
          </div>

          <v-alert v-if="!store.chores.length" type="info" variant="tonal">
            No library chores yet. Open the chooser to propose a new one.
          </v-alert>
          <v-btn v-else block color="secondary" prepend-icon="mdi-plus-circle-outline" variant="flat" @click="dialogOpen = true">
            Open chore chooser
          </v-btn>
        </v-sheet>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" lg="6">
        <v-sheet class="app-surface child-list-panel pa-5 h-100">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div>
              <div class="text-overline">Pending approval</div>
              <div class="text-h5 font-weight-bold">Sent to parent</div>
            </div>
            <v-chip color="warning" variant="outlined">{{ store.currentMonthPendingSubmissions.length }} pending</v-chip>
          </div>

          <div v-if="store.currentMonthPendingSubmissions.length" class="child-ticket-stack">
            <div v-for="entry in store.currentMonthPendingSubmissions.slice(0, 6)" :key="entry.id" class="child-ticket">
              <div>
                <div class="child-ticket-title">{{ entry.choreName }}</div>
                <div class="child-ticket-meta">{{ formatShortDate(entry.date) }} · waiting for approval</div>
              </div>
              <div class="child-ticket-points">{{ entry.points }}</div>
            </div>
          </div>

          <v-alert v-else type="success" variant="tonal">
            Nothing waiting right now.
          </v-alert>
        </v-sheet>
      </v-col>

      <v-col cols="12" lg="6">
        <v-sheet class="app-surface child-list-panel pa-5 h-100">
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
            <div>
              <div class="text-overline">Recent activity</div>
              <div class="text-h5 font-weight-bold">This month</div>
            </div>
            <v-chip color="secondary" variant="outlined">{{ store.childRecentSubmissions.length }} recent</v-chip>
          </div>

          <div v-if="store.childRecentSubmissions.length" class="child-activity-stack">
            <div v-for="entry in store.childRecentSubmissions" :key="entry.id" class="child-activity-row">
              <div class="child-activity-badge" :class="`status-${entry.status}`">{{ entry.points }}</div>
              <div class="flex-grow-1">
                <div class="font-weight-bold">{{ entry.choreName }}</div>
                <div class="text-body-2 opacity-70">{{ formatShortDate(entry.date) }} · {{ statusLabel(entry.status) }}</div>
              </div>
              <v-icon :color="statusColor(entry.status)" :icon="statusIcon(entry.status)" />
            </div>
          </div>

          <v-alert v-else type="info" variant="tonal">
            No submissions yet this month.
          </v-alert>
        </v-sheet>
      </v-col>
    </v-row>

    <AddChoreDialog v-model="dialogOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AddChoreDialog from '../components/AddChoreDialog.vue'
import { formatMonthLabel, formatShortDate } from '../lib/date'
import { useAppStore } from '../stores/app'
import type { SubmissionStatus } from '../types/domain'

const store = useAppStore()
const dialogOpen = ref(false)
const metrics = computed(() => store.currentMonthMetrics)
const monthLabel = computed(() => formatMonthLabel(store.currentMonth))
const progressValue = computed(() => Math.min(100, Math.round((metrics.value.totalPoints / metrics.value.goalTarget) * 100)))
const headline = computed(() => (store.settings.kidName ? `${store.settings.kidName}'s quest board` : 'Your chore quest'))
const rewardGoalLabel = computed(() => metrics.value.rewardGoal || 'Ask your parent to set a reward')
const pointsToGoal = computed(() => Math.max(metrics.value.goalTarget - metrics.value.totalPoints, 0))
const pointsToGoalCopy = computed(() => (pointsToGoal.value === 0 ? 'Goal reached. Keep going.' : `${pointsToGoal.value} approved points left.`))
const quickChores = computed(() => store.chores.slice(0, 4))

function statusColor(status: SubmissionStatus): string {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'error'
  return 'warning'
}

function statusLabel(status: SubmissionStatus): string {
  if (status === 'approved') return 'approved'
  if (status === 'rejected') return 'not approved'
  return 'pending'
}

function statusIcon(status: SubmissionStatus): string {
  if (status === 'approved') return 'mdi-check-decagram'
  if (status === 'rejected') return 'mdi-close-octagon'
  return 'mdi-timer-sand'
}
</script>
