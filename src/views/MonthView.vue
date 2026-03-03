<template>
  <div>
    <v-sheet class="app-surface pa-5 mb-5">
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-4">
        <div>
          <div class="text-overline">Month detail</div>
          <div class="text-h4 font-weight-bold">{{ monthLabel }}</div>
        </div>
        <div class="d-flex ga-2">
          <v-btn icon="mdi-chevron-left" variant="tonal" @click="goPreviousMonth" />
          <v-btn :disabled="selectedMonth >= store.currentMonth" icon="mdi-chevron-right" variant="tonal" @click="goNextMonth" />
        </div>
      </div>

      <v-row>
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <div class="text-overline">Approved points</div>
            <div class="text-h4 font-weight-bold">{{ metrics.totalPoints }}</div>
            <div class="text-body-2 opacity-70 mt-2">{{ metrics.chorePoints }} chore + {{ metrics.bonusPoints }} bonus</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <div class="text-overline">Current streak</div>
            <div class="text-h4 font-weight-bold">{{ metrics.currentStreak }}</div>
            <div class="text-body-2 opacity-70 mt-2">Longest: {{ metrics.longestStreak }} days</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <div class="text-overline">Goal</div>
            <div class="text-h4 font-weight-bold">{{ metrics.goalTarget }}</div>
            <div class="text-body-2 opacity-70 mt-2">{{ metrics.goalReached ? 'Reached' : 'In progress' }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <div class="text-overline">Reward</div>
            <div class="text-h6 font-weight-bold">{{ metrics.rewardGoal || 'Not set' }}</div>
            <div class="text-body-2 opacity-70 mt-2">Bonus days: {{ metrics.streakBonusDates.length }}</div>
          </v-card>
        </v-col>
      </v-row>
    </v-sheet>

    <div class="calendar-grid mb-4">
      <div v-for="label in weekdayLabels" :key="label" class="text-overline text-center opacity-70">{{ label }}</div>
    </div>

    <div class="calendar-grid compact">
      <div v-for="cell in monthGrid" :key="cell.key">
        <v-sheet
          v-if="cell.date"
          class="calendar-cell pa-3 border d-flex flex-column justify-space-between"
          :color="cell.summary?.bonusAwarded ? 'amber-lighten-5' : undefined"
          @click="openDay(cell.date)"
        >
          <div class="d-flex align-center justify-space-between">
            <span class="text-subtitle-2 font-weight-bold">{{ cell.label }}</span>
            <v-icon v-if="cell.summary?.qualifying" color="primary" icon="mdi-fire" size="18" />
          </div>
          <div>
            <div class="text-h6 font-weight-bold">{{ cell.summary?.totalPoints ?? 0 }}</div>
            <div class="text-caption opacity-70">approved points</div>
          </div>
          <v-chip v-if="cell.summary?.bonusAwarded" color="accent" size="small" variant="tonal">Bonus day</v-chip>
        </v-sheet>
        <div v-else class="calendar-cell" />
      </div>
    </div>

    <DayLogsDialog v-model="dayDialogOpen" :date="selectedDay" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DayLogsDialog from '../components/DayLogsDialog.vue'
import { formatMonthLabel, getMonthGrid, parseDateKey, shiftMonth } from '../lib/date'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const dayDialogOpen = ref(false)
const selectedDay = ref<string | null>(null)
const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const selectedMonth = computed(() => {
  const queryMonth = typeof route.query.month === 'string' ? route.query.month : store.currentMonth
  return /^\d{4}-\d{2}$/.test(queryMonth) ? queryMonth : store.currentMonth
})
const metrics = computed(() => store.getMonthMetrics(selectedMonth.value))
const monthLabel = computed(() => formatMonthLabel(selectedMonth.value))
const monthGrid = computed(() =>
  getMonthGrid(selectedMonth.value).map((date, index) => {
    if (!date) {
      return { key: `empty-${index}`, date: null as string | null, label: '', summary: null }
    }

    return {
      key: date,
      date,
      label: String(parseDateKey(date).getDate()),
      summary: metrics.value.daySummaries[date],
    }
  }),
)

function setMonth(month: string): void {
  router.replace({ path: '/parent/month', query: { month } })
}

function goPreviousMonth(): void {
  setMonth(shiftMonth(selectedMonth.value, -1))
}

function goNextMonth(): void {
  const nextMonth = shiftMonth(selectedMonth.value, 1)
  if (nextMonth <= store.currentMonth) {
    setMonth(nextMonth)
  }
}

function openDay(date: string): void {
  selectedDay.value = date
  dayDialogOpen.value = true
}
</script>
