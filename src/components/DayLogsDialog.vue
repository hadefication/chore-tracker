<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <div>
          <div class="text-overline">Approved chores</div>
          <div class="text-h6 font-weight-bold">{{ heading }}</div>
        </div>
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-5">
        <v-list v-if="entries.length" lines="two">
          <v-list-item v-for="entry in entries" :key="entry.id">
            <template #prepend>
              <v-avatar color="primary" size="40">{{ entry.points }}</v-avatar>
            </template>
            <v-list-item-title>{{ entry.choreName }}</v-list-item-title>
            <v-list-item-subtitle>{{ entry.points }} points approved</v-list-item-subtitle>
          </v-list-item>
        </v-list>
        <v-alert v-else type="info" variant="tonal">No approved chores for this day.</v-alert>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-5 py-4 justify-space-between">
        <v-chip color="secondary" variant="tonal">{{ totalPoints }} points</v-chip>
        <v-btn variant="outlined" @click="emit('update:modelValue', false)">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { formatLongDate } from '../lib/date'
import { useAppStore } from '../stores/app'

const props = defineProps<{
  modelValue: boolean
  date: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useAppStore()
const entries = computed(() => (props.date ? store.getApprovedSubmissionsForDate(props.date) : []))
const totalPoints = computed(() => entries.value.reduce((sum, entry) => sum + entry.points, 0))
const heading = computed(() => (props.date ? formatLongDate(props.date) : 'Day detail'))
</script>
