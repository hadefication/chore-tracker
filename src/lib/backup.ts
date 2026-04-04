import { db } from './db'
import type {
  AppStateRecord,
  Chore,
  ChoreSubmission,
  GoalCycle,
  MonthProfile,
  MonthlyArchive,
  SettingsRecord,
} from '../types/domain'

interface BackupPayload {
  version: number
  exportedAt: string
  chores: Chore[]
  submissions: ChoreSubmission[]
  monthlyArchive: MonthlyArchive[]
  monthProfiles: MonthProfile[]
  goalCycles: GoalCycle[]
  settings: SettingsRecord | null
  appState: AppStateRecord | null
}

const CURRENT_VERSION = 1

export async function exportBackup(): Promise<BackupPayload> {
  const [chores, submissions, monthlyArchive, monthProfiles, goalCycles, settings, appState] = await Promise.all([
    db.chores.toArray(),
    db.submissions.toArray(),
    db.monthlyArchive.toArray(),
    db.monthProfiles.toArray(),
    db.goalCycles.toArray(),
    db.settings.get('settings'),
    db.appState.get('app-state'),
  ])

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    chores,
    submissions,
    monthlyArchive,
    monthProfiles,
    goalCycles,
    settings: settings ?? null,
    appState: appState ?? null,
  }
}

export function downloadBackup(payload: BackupPayload): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const date = new Date().toISOString().slice(0, 10)

  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `chore-tracker-backup-${date}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function importBackup(file: File): Promise<{ records: number }> {
  const text = await file.text()
  const data: BackupPayload = JSON.parse(text)

  if (!data.version || !Array.isArray(data.chores) || !Array.isArray(data.submissions)) {
    throw new Error('Invalid backup file.')
  }

  await db.transaction('rw', [db.chores, db.submissions, db.monthlyArchive, db.monthProfiles, db.goalCycles, db.settings, db.appState], async () => {
    await Promise.all([
      db.chores.clear(),
      db.submissions.clear(),
      db.monthlyArchive.clear(),
      db.monthProfiles.clear(),
      db.goalCycles.clear(),
      db.settings.clear(),
      db.appState.clear(),
    ])

    await Promise.all([
      db.chores.bulkPut(data.chores),
      db.submissions.bulkPut(data.submissions),
      db.monthlyArchive.bulkPut(data.monthlyArchive),
      db.monthProfiles.bulkPut(data.monthProfiles),
      db.goalCycles.bulkPut(data.goalCycles),
      ...(data.settings ? [db.settings.put(data.settings)] : []),
      ...(data.appState ? [db.appState.put(data.appState)] : []),
    ])
  })

  const records =
    data.chores.length +
    data.submissions.length +
    data.monthlyArchive.length +
    data.monthProfiles.length +
    data.goalCycles.length +
    (data.settings ? 1 : 0) +
    (data.appState ? 1 : 0)

  return { records }
}
