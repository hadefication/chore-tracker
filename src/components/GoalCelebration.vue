<template>
  <v-dialog :model-value="visible" max-width="480" persistent>
    <v-card class="goal-celebration text-center pa-8">
      <div class="goal-celebration-badge mb-4">
        <v-icon :color="badgeColor" :icon="badgeIcon" size="72" />
      </div>
      <div class="text-h4 font-weight-black mb-2">You did it!</div>
      <div class="text-h6 font-weight-medium opacity-80 mb-4">{{ rewardGoal }}</div>
      <v-chip :color="badgeColor" class="mb-6" size="large" variant="flat">
        <v-icon :icon="badgeIcon" start />
        {{ badgeLabel }}
      </v-chip>
      <div>
        <v-btn block color="primary" size="large" variant="flat" @click="$emit('dismiss')">
          Awesome!
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import confetti from 'canvas-confetti'
import type { BadgeTier } from '../types/domain'

const props = defineProps<{
  visible: boolean
  rewardGoal: string
  badge: BadgeTier
}>()

defineEmits<{ dismiss: [] }>()

const badgeConfig: Record<BadgeTier, { color: string; icon: string; label: string }> = {
  'perfect-month': { color: 'amber-darken-1', icon: 'mdi-star-circle', label: 'Perfect Month' },
  'speed-run': { color: 'blue-grey-lighten-1', icon: 'mdi-lightning-bolt-circle', label: 'Speed Run' },
  standard: { color: 'deep-orange-lighten-1', icon: 'mdi-check-decagram', label: 'Goal Complete' },
}

const badgeColor = computed(() => badgeConfig[props.badge].color)
const badgeIcon = computed(() => badgeConfig[props.badge].icon)
const badgeLabel = computed(() => badgeConfig[props.badge].label)

function fireConfetti() {
  const duration = 2000
  const end = Date.now() + duration
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']

  function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

import { computed } from 'vue'

watch(
  () => props.visible,
  (val) => {
    if (val) fireConfetti()
  },
)

onMounted(() => {
  if (props.visible) fireConfetti()
})
</script>

<style scoped>
.goal-celebration {
  overflow: visible;
}

.goal-celebration-badge {
  display: inline-flex;
  padding: 16px;
  border-radius: 50%;
  background: rgba(var(--v-theme-surface-variant), 0.1);
}
</style>
