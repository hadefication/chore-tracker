<template>
  <v-app :class="['app-frame', isParentArea ? 'app-frame-parent' : 'app-frame-child']">
    <div class="app-noise" aria-hidden="true" />

    <v-app-bar class="app-topbar px-2" flat>
      <template #prepend>
        <div class="app-mark">
          <v-avatar :color="isParentArea ? 'secondary' : 'primary'" size="44">
            <v-icon :icon="isParentArea ? 'mdi-clipboard-check-outline' : 'mdi-star-four-points-circle-outline'" />
          </v-avatar>
          <div>
            <div v-if="isParentArea" class="app-mark-label">Parent Station</div>
            <div class="app-mark-title">{{ title }}</div>
          </div>
        </div>
      </template>

      <template #append>
        <v-chip v-if="isParentArea" class="mr-2 d-none d-sm-inline-flex app-mode-chip" color="secondary" variant="outlined">
          Approval locked
        </v-chip>
        <v-btn
          v-if="isParentArea"
          class="app-action-btn"
          color="secondary"
          prepend-icon="mdi-undo-variant"
          variant="flat"
          @click="leaveParentMode"
        >
          Kid view
        </v-btn>
        <v-btn
          v-else
          class="app-action-btn"
          color="secondary"
          prepend-icon="mdi-shield-account-outline"
          variant="flat"
          @click="router.push('/parent')"
        >
          Parent
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <v-container class="app-container py-4 py-sm-6" fluid max-width="1220">
        <v-progress-linear v-if="!store.ready" class="mb-4" color="primary" indeterminate rounded />
        <router-view v-else />
      </v-container>
    </v-main>

    <v-bottom-navigation v-if="isParentArea" class="app-bottom-nav" grow height="78">
      <v-btn
        v-for="item in parentNavigationItems"
        :key="item.to"
        :active="route.path === item.to"
        :to="item.to"
        rounded="0"
      >
        <v-icon :icon="item.icon" />
        <span>{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { parentNavigationItems } from '../router'
import { useAppStore } from '../stores/app'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const isParentArea = computed(() => route.path.startsWith('/parent') && route.path !== '/parent')
const title = computed(() => (isParentArea.value ? 'Chore Tracker Parent' : 'Chore Quest'))

function leaveParentMode(): void {
  store.logoutParent()
  router.push('/')
}
</script>
