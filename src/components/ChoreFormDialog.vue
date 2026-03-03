<template>
  <v-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <span class="text-h6 font-weight-bold">{{ title }}</span>
        <v-btn icon="mdi-close" variant="text" @click="emit('update:modelValue', false)" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-5">
        <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">{{ errorMessage }}</v-alert>
        <v-row>
          <v-col cols="12" md="8">
            <v-text-field v-model="name" label="Chore name" />
          </v-col>
          <v-col cols="12" md="4">
            <v-text-field v-model="points" label="Default points" min="1" step="1" type="number" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-5 py-4 justify-space-between">
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" prepend-icon="mdi-content-save-outline" @click="submit">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Chore } from '../types/domain'

const props = defineProps<{
  modelValue: boolean
  chore?: Chore | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: [payload: { name: string; defaultPoints: number }]
}>()

const name = ref('')
const points = ref('1')
const errorMessage = ref('')
const title = computed(() => (props.chore ? 'Edit chore' : 'Add chore'))

watch(
  () => [props.modelValue, props.chore] as const,
  ([open, chore]) => {
    if (!open) {
      return
    }

    name.value = chore?.name ?? ''
    points.value = String(chore?.defaultPoints ?? 1)
    errorMessage.value = ''
  },
  { immediate: true },
)

function submit(): void {
  if (!name.value.trim()) {
    errorMessage.value = 'Enter a chore name.'
    return
  }

  if (Number(points.value) <= 0) {
    errorMessage.value = 'Points must be greater than zero.'
    return
  }

  emit('save', {
    name: name.value,
    defaultPoints: Number(points.value),
  })
}
</script>
