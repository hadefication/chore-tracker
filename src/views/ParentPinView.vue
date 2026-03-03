<template>
  <v-row justify="center" class="parent-pin-wrap">
    <v-col cols="12" md="8" lg="5">
      <v-card class="app-surface parent-pin-card pa-6 pa-md-8">
        <div class="parent-pin-emblem mb-5">
          <v-icon icon="mdi-shield-key-outline" size="32" />
        </div>
        <div class="parent-kicker">Parent access</div>
        <div class="parent-heading mb-2">{{ headline }}</div>
        <p class="parent-copy mb-5">
          {{ copy }}
        </p>

        <v-alert v-if="errorMessage" class="mb-4" type="error" variant="tonal">{{ errorMessage }}</v-alert>

        <template v-if="store.hasParentPin">
          <v-text-field v-model="pin" autocomplete="one-time-code" label="Parent PIN" maxlength="12" type="password" />
          <div class="d-flex justify-space-between ga-3 flex-wrap">
            <v-btn variant="text" @click="router.push('/')">Cancel</v-btn>
            <v-btn color="primary" prepend-icon="mdi-lock-open-outline" variant="flat" @click="login">Open parent mode</v-btn>
          </div>
        </template>

        <template v-else>
          <v-text-field v-model="pin" label="Create parent PIN" maxlength="12" type="password" />
          <v-text-field v-model="confirmPin" label="Confirm PIN" maxlength="12" type="password" />
          <div class="d-flex justify-space-between ga-3 flex-wrap">
            <v-btn variant="text" @click="router.push('/')">Cancel</v-btn>
            <v-btn color="primary" prepend-icon="mdi-shield-key-outline" variant="flat" @click="createPin">Save PIN</v-btn>
          </div>
        </template>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/app'

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const pin = ref('')
const confirmPin = ref('')
const errorMessage = ref('')
const headline = computed(() => (store.hasParentPin ? 'Unlock parent mode' : 'Create the parent PIN'))
const copy = computed(() =>
  store.hasParentPin
    ? 'Enter your PIN to review submissions, approve chores, and manage settings.'
    : 'Set the PIN that protects parent approvals and admin controls on this device.',
)

function resolveNextRoute(): string {
  return typeof route.query.next === 'string' ? route.query.next : '/parent/approvals'
}

function login(): void {
  try {
    errorMessage.value = ''
    store.loginParent(pin.value)
    router.replace(resolveNextRoute())
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to enter parent mode.'
  }
}

async function createPin(): Promise<void> {
  try {
    errorMessage.value = ''
    if (pin.value.trim() !== confirmPin.value.trim()) {
      throw new Error('PIN entries do not match.')
    }

    await store.setParentPin(pin.value)
    store.loginParent(pin.value)
    router.replace('/parent/approvals')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Unable to save PIN.'
  }
}
</script>
