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

    <v-sheet v-if="store.completedCycles.length" class="app-surface pa-5 mb-5">
      <TrophyShelf :cycles="store.completedCycles" :get-earned-points="store.getCycleEarnedPoints" />
    </v-sheet>

    <div v-if="store.historyEntries.length" class="parent-kicker mb-3">Monthly archives</div>
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

          <div class="d-flex flex-wrap ga-2">
            <v-btn class="flex-grow-1" color="secondary" prepend-icon="mdi-arrow-right" variant="flat" @click="openMonth(entry.month)">
              Open month detail
            </v-btn>
            <v-btn
              v-if="!store.isMonthResolved(entry.month)"
              class="flex-grow-1"
              color="warning"
              prepend-icon="mdi-trophy-outline"
              variant="tonal"
              @click="openResolveDialog(entry)"
            >
              Resolve
            </v-btn>
            <v-chip v-else color="success" variant="tonal">
              <v-icon icon="mdi-check" start />
              Resolved
            </v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-else type="info" variant="tonal">
      No approved history yet. Once approved chores land in a past month, cards will show here.
    </v-alert>

    <v-dialog v-model="resolveDialogOpen" max-width="480">
      <v-card v-if="resolveTarget" class="pa-6">
        <v-card-title class="text-h5 font-weight-bold pa-0 mb-4">
          Resolve {{ formatMonthLabel(resolveTarget.month) }}
        </v-card-title>

        <v-alert class="mb-5" :color="resolveTarget.goalReached ? 'success' : 'warning'" variant="tonal">
          <div>Points: <strong>{{ resolveTarget.totalPoints }}</strong> of {{ resolveTarget.goalTarget }} target</div>
          <div>Longest streak: <strong>{{ resolveTarget.longestStreak }}</strong> days</div>
          <div v-if="!resolveTarget.goalReached" class="mt-1 text-body-2">Goal was not reached.</div>
        </v-alert>

        <v-text-field
          v-model="resolveReward"
          label="Reward goal for this month"
          :rules="[(v: string) => !!v.trim() || 'Required']"
        />

        <v-card-actions class="pa-0 mt-4 justify-space-between">
          <v-btn variant="outlined" @click="resolveDialogOpen = false">Cancel</v-btn>
          <v-btn color="primary" variant="flat" :disabled="!resolveReward.trim()" @click="handleResolve">
            Resolve month
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import TrophyShelf from '../components/TrophyShelf.vue'
import { formatMonthLabel } from '../lib/date'
import { useAppStore } from '../stores/app'
import type { MonthlyArchive } from '../types/domain'

const router = useRouter()
const store = useAppStore()
const bestStreak = computed(() =>
  store.historyEntries.reduce((best, entry) => Math.max(best, entry.longestStreak), 0),
)

const resolveDialogOpen = ref(false)
const resolveTarget = ref<MonthlyArchive | null>(null)
const resolveReward = ref('')

function openMonth(month: string): void {
  router.push({ path: '/parent/month', query: { month } })
}

function openResolveDialog(entry: MonthlyArchive): void {
  resolveTarget.value = entry
  resolveReward.value = entry.rewardGoal ?? ''
  resolveDialogOpen.value = true
}

async function handleResolve(): Promise<void> {
  if (!resolveTarget.value) return
  await store.resolveHistoricalMonth(resolveTarget.value.month, resolveReward.value.trim())
  resolveDialogOpen.value = false
  resolveTarget.value = null
}
</script>
