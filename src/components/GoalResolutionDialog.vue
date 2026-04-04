<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="pa-6">
      <v-card-title class="text-h5 font-weight-bold pa-0 mb-4">Resolve & Set New Goal</v-card-title>

      <v-alert class="mb-5" color="success" variant="tonal">
        <div class="font-weight-bold mb-1">Win summary</div>
        <div>Reward: <strong>{{ cycle.rewardGoal }}</strong></div>
        <div>Points earned: <strong>{{ earnedPoints }}</strong> of {{ cycle.goalTarget }} target</div>
        <div v-if="excessPoints > 0">Excess points: <strong>{{ excessPoints }}</strong></div>
        <div>Badge: <strong>{{ badgeLabel }}</strong></div>
        <div>Started: {{ formatDate(cycle.startedAt) }}</div>
      </v-alert>

      <v-text-field
        v-model="form.rewardGoal"
        class="mb-2"
        label="New reward goal"
        :rules="[required]"
      />

      <v-text-field
        v-model="form.goalTarget"
        class="mb-2"
        label="New point target"
        min="1"
        type="number"
      />

      <v-checkbox
        v-if="excessPoints > 0"
        v-model="form.carryOver"
        :label="`Carry over ${excessPoints} extra points`"
      />

      <v-card-actions class="pa-0 mt-4 justify-space-between">
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" variant="flat" :disabled="!form.rewardGoal.trim()" @click="resolve">
          Start new cycle
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { BadgeTier, GoalCycle } from '../types/domain'

const props = defineProps<{
  modelValue: boolean
  cycle: GoalCycle
  earnedPoints: number
  totalPoints: number
  badge: BadgeTier
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  resolve: [payload: { rewardGoal: string; goalTarget: number; carryOver: boolean }]
}>()

const badgeLabels: Record<BadgeTier, string> = {
  'perfect-month': 'Perfect Month',
  'speed-run': 'Speed Run',
  standard: 'Goal Complete',
}

const badgeLabel = computed(() => badgeLabels[props.badge])
const excessPoints = computed(() => Math.max(props.totalPoints - props.cycle.goalTarget, 0))

const form = reactive({
  rewardGoal: '',
  goalTarget: '100',
  carryOver: true,
})

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.rewardGoal = ''
      form.goalTarget = String(props.cycle.goalTarget)
      form.carryOver = true
    }
  },
)

function required(v: string) {
  return !!v.trim() || 'Required'
}

function resolve() {
  emit('resolve', {
    rewardGoal: form.rewardGoal.trim(),
    goalTarget: Number(form.goalTarget),
    carryOver: form.carryOver,
  })
  emit('update:modelValue', false)
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(iso))
}

import { computed } from 'vue'
</script>
