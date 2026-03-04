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
              <div class="d-flex align-center ga-2 flex-wrap mb-1">
                <div class="parent-queue-title">{{ entry.choreName }}</div>
                <v-chip :color="entry.kind === 'proposed' ? 'secondary' : 'primary'" size="small" variant="tonal">
                  {{ entry.kind === 'proposed' ? 'Proposed chore' : 'Library chore' }}
                </v-chip>
              </div>
              <div class="parent-queue-meta">{{ formatLongDate(entry.date) }}</div>
              <div class="parent-queue-meta">Submitted {{ submittedLabel(entry.submittedAt) }}</div>
            </div>
            <div class="parent-points-badge">{{ entry.points }}</div>
          </div>

          <div class="d-flex ga-2 flex-wrap">
            <v-btn color="success" prepend-icon="mdi-check" variant="flat" @click="approve(entry)">
              Approve
            </v-btn>
            <v-btn color="error" prepend-icon="mdi-close" variant="outlined" @click="reject(entry.id)">
              Reject
            </v-btn>
          </div>
        </v-sheet>
      </div>

      <v-alert v-else type="success" variant="tonal">
        No chores are waiting for approval right now.
      </v-alert>
    </div>

    <v-dialog v-model="approvalDialogOpen" max-width="560">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
          <div>
            <div class="text-overline">Approve proposed chore</div>
            <div class="text-h6 font-weight-bold">Adjust details before approval</div>
          </div>
          <v-btn icon="mdi-close" variant="text" @click="closeApprovalDialog" />
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-alert v-if="approvalError" class="mb-4" type="error" variant="tonal">
            {{ approvalError }}
          </v-alert>

          <v-row>
            <v-col cols="12" md="8">
              <v-text-field v-model="approvalDraft.name" label="Chore name" />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field v-model="approvalDraft.points" label="Points" min="1" step="1" type="number" />
            </v-col>
          </v-row>

          <v-checkbox
            v-model="approvalDraft.addToLibrary"
            color="secondary"
            density="comfortable"
            hide-details
            label="Add to library on approval"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-5 py-4 justify-space-between">
          <v-btn variant="outlined" @click="closeApprovalDialog">Cancel</v-btn>
          <v-btn color="success" prepend-icon="mdi-check" variant="flat" @click="confirmApproval">
            Approve chore
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { formatLongDate } from '../lib/date'
import { useAppStore } from '../stores/app'
import type { ChoreSubmission } from '../types/domain'

const store = useAppStore()
const metrics = computed(() => store.currentMonthMetrics)
const approvalDialogOpen = ref(false)
const approvalError = ref('')
const activeApprovalEntry = ref<ChoreSubmission | null>(null)
const approvalDraft = ref({
  name: '',
  points: '1',
  addToLibrary: false,
})

function submittedLabel(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

async function approve(entry: ChoreSubmission): Promise<void> {
  if (entry.kind === 'library') {
    await store.approveSubmission(entry.id)
    return
  }

  approvalError.value = ''
  activeApprovalEntry.value = entry
  approvalDraft.value = {
    name: entry.choreName,
    points: String(entry.points),
    addToLibrary: false,
  }
  approvalDialogOpen.value = true
}

function closeApprovalDialog(): void {
  approvalDialogOpen.value = false
  approvalError.value = ''
  activeApprovalEntry.value = null
}

async function confirmApproval(): Promise<void> {
  if (!activeApprovalEntry.value) {
    return
  }

  try {
    approvalError.value = ''
    await store.approveSubmission(activeApprovalEntry.value.id, {
      choreName: approvalDraft.value.name,
      points: Number(approvalDraft.value.points),
      addToLibrary: approvalDraft.value.addToLibrary,
    })
    closeApprovalDialog()
  } catch (error) {
    approvalError.value = error instanceof Error ? error.message : 'Unable to approve chore.'
  }
}

async function reject(submissionId: string): Promise<void> {
  await store.rejectSubmission(submissionId)
  if (activeApprovalEntry.value?.id === submissionId) {
    closeApprovalDialog()
  }
}
</script>
