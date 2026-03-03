<template>
  <div>
    <v-sheet class="app-surface pa-5 mb-5 d-flex flex-wrap align-center justify-space-between ga-3">
      <div>
        <div class="text-overline">Library</div>
        <div class="text-h4 font-weight-bold">Parent-managed chores</div>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreateDialog">Add chore</v-btn>
    </v-sheet>

    <v-row v-if="store.chores.length">
      <v-col v-for="chore in store.chores" :key="chore.id" cols="12" md="6" xl="4">
        <v-card class="pa-5 h-100 app-surface">
          <div class="d-flex align-start justify-space-between ga-3">
            <div>
              <div class="text-h6 font-weight-bold">{{ chore.name }}</div>
              <div class="text-body-1 opacity-70">{{ chore.defaultPoints }} points on approval</div>
            </div>
            <v-chip color="accent" variant="tonal">{{ chore.defaultPoints }} pts</v-chip>
          </div>
          <div class="d-flex ga-2 mt-5">
            <v-btn color="secondary" prepend-icon="mdi-pencil-outline" variant="tonal" @click="openEditDialog(chore)">Edit</v-btn>
            <v-btn color="error" prepend-icon="mdi-delete-outline" variant="text" @click="store.deleteChore(chore.id)">Delete</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-else type="info" variant="tonal">
      Build the chore list here. Kids can only submit from this library.
    </v-alert>

    <ChoreFormDialog v-model="dialogOpen" :chore="selectedChore" @save="saveChore" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChoreFormDialog from '../components/ChoreFormDialog.vue'
import { useAppStore } from '../stores/app'
import type { Chore } from '../types/domain'

const store = useAppStore()
const dialogOpen = ref(false)
const selectedChore = ref<Chore | null>(null)

function openCreateDialog(): void {
  selectedChore.value = null
  dialogOpen.value = true
}

function openEditDialog(chore: Chore): void {
  selectedChore.value = chore
  dialogOpen.value = true
}

async function saveChore(payload: { name: string; defaultPoints: number }): Promise<void> {
  if (selectedChore.value) {
    await store.updateChore(selectedChore.value.id, payload)
  } else {
    await store.addChore(payload)
  }

  dialogOpen.value = false
}
</script>
