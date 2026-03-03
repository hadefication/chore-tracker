<template>
  <v-dialog :model-value="modelValue" scrollable @update:model-value="emit('update:modelValue', $event)">
    <v-card class="app-surface child-dialog-card">
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <div>
          <div class="text-overline">Chore submission</div>
          <span class="text-h5 font-weight-bold">Log a completed chore</span>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="close" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">
          {{ errorMessage }}
        </v-alert>

        <div class="mb-5">
          <div class="text-overline">Choose a chore</div>
          <div class="text-h6 font-weight-bold mb-3">Tap what you finished</div>

          <div class="child-dialog-grid">
            <button
              v-for="chore in chores"
              :key="chore.id"
              type="button"
              class="child-dialog-choice"
              :class="{ 'is-selected': selectedChoreId === chore.id }"
              @click="selectedChoreId = chore.id"
            >
              <span>
                <strong class="d-block text-subtitle-1">{{ chore.name }}</strong>
                <span class="text-body-2 opacity-70">Worth {{ chore.defaultPoints }} points after approval</span>
              </span>
              <v-icon :icon="selectedChoreId === chore.id ? 'mdi-check-circle' : 'mdi-circle-outline'" />
            </button>
          </div>

          <v-alert v-if="!chores.length" class="mt-4" type="info" variant="tonal">
            Ask your parent to add chores to the library first.
          </v-alert>
        </div>

        <div>
          <div class="text-overline">Submission date</div>
          <div class="text-h6 font-weight-bold mb-3">When did you finish it?</div>
          <v-text-field v-model="date" :max="today" label="Date" type="date" />
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="px-5 py-4 justify-space-between">
        <v-btn variant="outlined" @click="close">Cancel</v-btn>
        <v-btn :disabled="!canSave" color="primary" prepend-icon="mdi-send-outline" variant="flat" @click="submitChore">
          Send for approval
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getTodayDateKey } from '../lib/date'
import { useAppStore } from '../stores/app'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useAppStore()
const selectedChoreId = ref('')
const date = ref(getTodayDateKey())
const errorMessage = ref('')

const chores = computed(() => store.chores)
const today = getTodayDateKey()
const canSave = computed(() => Boolean(selectedChoreId.value) && date.value <= today)

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errorMessage.value = ''
      date.value = getTodayDateKey()
    }
  },
)

function close(): void {
  emit('update:modelValue', false)
}

async function submitChore(): Promise<void> {
  try {
    errorMessage.value = ''
    await store.submitChore(selectedChoreId.value, date.value)
    close()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to submit chore.'
  }
}
</script>
