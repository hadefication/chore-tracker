<template>
  <div>
    <v-sheet class="app-surface pa-5 mb-5">
      <div class="text-overline">Settings</div>
      <div class="text-h4 font-weight-bold mb-2">Parent controls</div>
      <p class="text-body-1 opacity-80 mb-0">
        These settings affect approvals, point goals, streak behavior, and parent access.
      </p>
    </v-sheet>

    <v-card class="app-surface pa-5">
      <v-alert v-if="saveMessage" class="mb-4" type="success" variant="tonal">{{ saveMessage }}</v-alert>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.kidName" label="Kid name" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.rewardGoal" label="Default reward goal (for new cycles)" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.monthlyGoal" label="Default point target (for new cycles)" min="1" type="number" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.streakDaysRequired" label="Days required for bonus" min="1" type="number" />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="form.streakBonusPoints" label="Bonus points" min="1" type="number" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.minChoresForStreakDay" label="Min approved chores for streak day" min="1" type="number" />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field :model-value="form.timezone" label="Timezone" readonly />
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field v-model="form.parentPin" label="Parent PIN" maxlength="12" type="password" />
        </v-col>
      </v-row>

      <div class="d-flex flex-wrap justify-space-between ga-3 mt-4">
        <v-btn color="error" prepend-icon="mdi-restart" variant="outlined" @click="confirmReset = true">Reset current month</v-btn>
        <div class="d-flex ga-3">
          <v-btn color="secondary" prepend-icon="mdi-logout" variant="outlined" @click="logout">Exit parent mode</v-btn>
          <v-btn color="primary" prepend-icon="mdi-content-save-outline" variant="flat" @click="saveSettings">Save settings</v-btn>
        </div>
      </div>
    </v-card>

    <v-card class="app-surface pa-5 mt-5">
      <div class="text-overline mb-2">Data management</div>
      <p class="text-body-2 opacity-80 mb-4">
        Export all chore data as a JSON backup or import a previous backup to restore.
      </p>

      <v-alert v-if="backupMessage" class="mb-4" :type="backupMessageType" variant="tonal">{{ backupMessage }}</v-alert>

      <div class="d-flex flex-wrap ga-3">
        <v-btn color="primary" prepend-icon="mdi-download" variant="outlined" :loading="exporting" @click="handleExport">
          Export backup
        </v-btn>
        <v-btn color="warning" prepend-icon="mdi-upload" variant="outlined" @click="triggerImport">
          Import backup
        </v-btn>
        <input ref="fileInput" accept=".json" class="d-none" type="file" @change="handleImport" />
      </div>
    </v-card>

    <v-dialog v-model="confirmImport" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Replace all data?</v-card-title>
        <v-card-text>
          Importing will clear all current data and replace it with the backup. This cannot be undone.
        </v-card-text>
        <v-card-actions class="justify-space-between px-5 pb-4">
          <v-btn variant="outlined" @click="cancelImport">Cancel</v-btn>
          <v-btn color="warning" variant="flat" @click="confirmAndImport">Replace data</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmReset" max-width="420">
      <v-card>
        <v-card-title class="text-h6 font-weight-bold">Reset current month?</v-card-title>
        <v-card-text>
          This clears every current-month submission, including pending and approved ones. Past months stay intact.
        </v-card-text>
        <v-card-actions class="justify-space-between px-5 pb-4">
          <v-btn variant="outlined" @click="confirmReset = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="resetMonth">Reset month</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { downloadBackup, exportBackup, importBackup } from '../lib/backup'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const router = useRouter()
const confirmReset = ref(false)
const saveMessage = ref('')
const exporting = ref(false)
const confirmImport = ref(false)
const backupMessage = ref('')
const backupMessageType = ref<'success' | 'error'>('success')
const fileInput = ref<HTMLInputElement | null>(null)
const pendingFile = ref<File | null>(null)
const form = reactive({
  kidName: '',
  rewardGoal: '',
  monthlyGoal: '100',
  streakDaysRequired: '7',
  streakBonusPoints: '5',
  minChoresForStreakDay: '1',
  timezone: '',
  parentPin: '',
})

watch(
  () => store.settings,
  (settings) => {
    form.kidName = settings.kidName
    form.rewardGoal = settings.rewardGoal
    form.monthlyGoal = String(settings.monthlyGoal)
    form.streakDaysRequired = String(settings.streakDaysRequired)
    form.streakBonusPoints = String(settings.streakBonusPoints)
    form.minChoresForStreakDay = String(settings.minChoresForStreakDay)
    form.timezone = settings.timezone
    form.parentPin = settings.parentPin
  },
  { immediate: true, deep: true },
)

async function saveSettings(): Promise<void> {
  await store.updateSettings({
    kidName: form.kidName,
    rewardGoal: form.rewardGoal,
    monthlyGoal: Number(form.monthlyGoal),
    streakDaysRequired: Number(form.streakDaysRequired),
    streakBonusPoints: Number(form.streakBonusPoints),
    minChoresForStreakDay: Number(form.minChoresForStreakDay),
    timezone: form.timezone,
    parentPin: form.parentPin,
  })

  saveMessage.value = 'Settings saved.'
  window.setTimeout(() => {
    saveMessage.value = ''
  }, 2000)
}

async function resetMonth(): Promise<void> {
  await store.resetCurrentMonth()
  confirmReset.value = false
}

function logout(): void {
  store.logoutParent()
  router.push('/')
}

async function handleExport(): Promise<void> {
  exporting.value = true
  try {
    const payload = await exportBackup()
    downloadBackup(payload)
    backupMessageType.value = 'success'
    backupMessage.value = `Exported ${payload.submissions.length} submissions, ${payload.chores.length} chores, ${payload.goalCycles.length} cycles.`
  } catch {
    backupMessageType.value = 'error'
    backupMessage.value = 'Export failed.'
  } finally {
    exporting.value = false
  }
}

function triggerImport(): void {
  fileInput.value?.click()
}

function handleImport(event: Event): void {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  pendingFile.value = file
  confirmImport.value = true
  input.value = ''
}

function cancelImport(): void {
  confirmImport.value = false
  pendingFile.value = null
}

async function confirmAndImport(): Promise<void> {
  confirmImport.value = false
  const file = pendingFile.value
  pendingFile.value = null
  if (!file) return

  try {
    const result = await importBackup(file)
    await store.init()
    backupMessageType.value = 'success'
    backupMessage.value = `Imported ${result.records} records. Data restored.`
  } catch {
    backupMessageType.value = 'error'
    backupMessage.value = 'Import failed — file may be invalid.'
  }
}
</script>
