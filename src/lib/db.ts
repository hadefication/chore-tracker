import Dexie, { type Table } from 'dexie'
import type {
  AppStateRecord,
  Chore,
  ChoreSubmission,
  GoalCycle,
  MonthProfile,
  MonthlyArchive,
  SettingsRecord,
} from '../types/domain'

class ChoreTrackerDatabase extends Dexie {
  chores!: Table<Chore, string>
  submissions!: Table<ChoreSubmission, string>
  monthlyArchive!: Table<MonthlyArchive, string>
  settings!: Table<SettingsRecord, string>
  appState!: Table<AppStateRecord, string>
  monthProfiles!: Table<MonthProfile, string>
  goalCycles!: Table<GoalCycle, string>

  constructor() {
    super('chore-tracker-approval')

    this.version(1).stores({
      chores: 'id, name, updatedAt',
      submissions: 'id, date, choreId, status, submittedAt',
      monthlyArchive: 'month, archivedAt',
      settings: 'id',
      appState: 'id',
      monthProfiles: 'month, updatedAt',
    })

    this.version(2)
      .stores({
        chores: 'id, name, updatedAt',
        submissions: 'id, date, choreId, kind, status, submittedAt',
        monthlyArchive: 'month, archivedAt',
        settings: 'id',
        appState: 'id',
        monthProfiles: 'month, updatedAt',
      })
      .upgrade(async (tx) => {
        await tx
          .table('submissions')
          .toCollection()
          .modify((submission) => {
            submission.kind = submission.kind ?? 'library'
            submission.choreId = submission.choreId ?? null
          })
      })

    this.version(3)
      .stores({
        chores: 'id, name, updatedAt',
        submissions: 'id, date, choreId, kind, status, submittedAt',
        monthlyArchive: 'month, archivedAt',
        settings: 'id',
        appState: 'id',
        monthProfiles: 'month, updatedAt',
        goalCycles: 'id, completedAt',
      })
  }
}

export const db = new ChoreTrackerDatabase()
