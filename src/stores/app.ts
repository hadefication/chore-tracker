import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { clearParentSession, hasParentSession, startParentSession } from '../lib/auth'
import { db } from '../lib/db'
import { getCurrentMonthKey, getCurrentMonthKey as getLiveCurrentMonthKey, getMonthKeyFromDate, getTodayDateKey } from '../lib/date'
import { createId } from '../lib/ids'
import { createMonthlyArchiveSnapshot } from '../lib/archive'
import { calculateMonthMetrics } from '../lib/metrics'
import type {
  AppStateRecord,
  Chore,
  ChoreDraft,
  ChoreSubmission,
  MonthMetrics,
  MonthProfile,
  MonthlyArchive,
  SettingsDraft,
  SettingsRecord,
} from '../types/domain'

const SETTINGS_ID = 'settings' as const
const APP_STATE_ID = 'app-state' as const

function nowIso(): string {
  return new Date().toISOString()
}

function defaultSettings(): SettingsRecord {
  return {
    id: SETTINGS_ID,
    monthlyGoal: 100,
    streakDaysRequired: 7,
    streakBonusPoints: 5,
    minChoresForStreakDay: 1,
    rewardGoal: '',
    kidName: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    parentPin: '',
  }
}

function defaultAppState(): AppStateRecord {
  return {
    id: APP_STATE_ID,
    lastActiveMonth: getCurrentMonthKey(),
    lastOpenedAt: nowIso(),
  }
}

function createMonthProfile(month: string, settings: SettingsRecord): MonthProfile {
  return {
    month,
    goalTarget: settings.monthlyGoal,
    rewardGoal: settings.rewardGoal,
    streakDaysRequired: settings.streakDaysRequired,
    streakBonusPoints: settings.streakBonusPoints,
    minChoresForStreakDay: settings.minChoresForStreakDay,
    updatedAt: nowIso(),
  }
}

function sortChores(list: Chore[]): Chore[] {
  return list.slice().sort((left, right) => left.name.localeCompare(right.name))
}

function sortSubmissions(list: ChoreSubmission[]): ChoreSubmission[] {
  return list.slice().sort((left, right) => right.date.localeCompare(left.date) || right.submittedAt.localeCompare(left.submittedAt))
}

function sortArchives(list: MonthlyArchive[]): MonthlyArchive[] {
  return list.slice().sort((left, right) => right.month.localeCompare(left.month))
}

function validatePositiveNumber(value: number, label: string): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${label} must be greater than zero.`)
  }
  return parsed
}

export const useAppStore = defineStore('app', () => {
  const ready = ref(false)
  const parentAuthenticated = ref(false)
  const chores = ref<Chore[]>([])
  const submissions = ref<ChoreSubmission[]>([])
  const archives = ref<MonthlyArchive[]>([])
  const monthProfiles = ref<MonthProfile[]>([])
  const settings = ref<SettingsRecord>(defaultSettings())
  const appState = ref<AppStateRecord>(defaultAppState())

  const currentMonth = computed(() => getLiveCurrentMonthKey())
  const approvedSubmissions = computed(() => submissions.value.filter((entry) => entry.status === 'approved'))
  const pendingSubmissions = computed(() => sortSubmissions(submissions.value.filter((entry) => entry.status === 'pending')))
  const rejectedSubmissions = computed(() => sortSubmissions(submissions.value.filter((entry) => entry.status === 'rejected')))
  const currentMonthProfile = computed(() => getMonthProfile(currentMonth.value))
  const currentMonthMetrics = computed(() => calculateMonthMetrics(approvedSubmissions.value, currentMonth.value, currentMonthProfile.value))
  const todayApprovedSubmissions = computed(() => approvedSubmissions.value.filter((entry) => entry.date === getTodayDateKey()))
  const todayPendingSubmissions = computed(() => pendingSubmissions.value.filter((entry) => entry.date === getTodayDateKey()))
  const currentMonthPendingSubmissions = computed(() => pendingSubmissions.value.filter((entry) => getMonthKeyFromDate(entry.date) === currentMonth.value))
  const childRecentSubmissions = computed(() =>
    sortSubmissions(submissions.value.filter((entry) => getMonthKeyFromDate(entry.date) === currentMonth.value)).slice(0, 8),
  )
  const hasParentPin = computed(() => settings.value.parentPin.length >= 4)
  const historyEntries = computed(() => {
    const archiveMap = new Map(archives.value.map((archive) => [archive.month, archive]))
    const months = new Set<string>()

    for (const archive of archives.value) {
      months.add(archive.month)
    }

    for (const entry of approvedSubmissions.value) {
      const month = getMonthKeyFromDate(entry.date)
      if (month < currentMonth.value) {
        months.add(month)
      }
    }

    return Array.from(months)
      .sort((left, right) => right.localeCompare(left))
      .map((month) => archiveMap.get(month) ?? createArchiveSnapshot(month))
  })

  function getMonthProfile(month: string): MonthProfile {
    return monthProfiles.value.find((profile) => profile.month === month) ?? createMonthProfile(month, settings.value)
  }

  function getMonthMetrics(month: string): MonthMetrics {
    return calculateMonthMetrics(approvedSubmissions.value, month, getMonthProfile(month))
  }

  function getApprovedSubmissionsForDate(dateKey: string): ChoreSubmission[] {
    return approvedSubmissions.value.filter((entry) => entry.date === dateKey)
  }

  function createArchiveSnapshot(month: string): MonthlyArchive {
    const profile = getMonthProfile(month)
    return createMonthlyArchiveSnapshot(approvedSubmissions.value, month, profile, nowIso())
  }

  async function loadState(): Promise<void> {
    const [loadedChores, loadedSubmissions, loadedArchives, loadedProfiles, loadedSettings, loadedAppState] = await Promise.all([
      db.chores.toArray(),
      db.submissions.toArray(),
      db.monthlyArchive.toArray(),
      db.monthProfiles.toArray(),
      db.settings.get(SETTINGS_ID),
      db.appState.get(APP_STATE_ID),
    ])

    chores.value = sortChores(loadedChores)
    submissions.value = sortSubmissions(loadedSubmissions)
    archives.value = sortArchives(loadedArchives)
    monthProfiles.value = loadedProfiles.sort((left, right) => right.month.localeCompare(left.month))
    settings.value = loadedSettings ?? defaultSettings()
    appState.value = loadedAppState ?? defaultAppState()
    parentAuthenticated.value = hasParentSession()
  }

  async function ensureBaseRecords(): Promise<void> {
    const existingSettings = await db.settings.get(SETTINGS_ID)
    if (!existingSettings) {
      await db.settings.put(defaultSettings())
    }

    const existingAppState = await db.appState.get(APP_STATE_ID)
    if (!existingAppState) {
      await db.appState.put(defaultAppState())
    }

    const monthKey = getCurrentMonthKey()
    const existingProfile = await db.monthProfiles.get(monthKey)
    if (!existingProfile) {
      const seed = existingSettings ?? defaultSettings()
      await db.monthProfiles.put(createMonthProfile(monthKey, seed))
    }
  }

  async function persistAppState(patch: Partial<AppStateRecord>): Promise<void> {
    const nextState: AppStateRecord = {
      ...appState.value,
      ...patch,
      id: APP_STATE_ID,
    }

    await db.appState.put(nextState)
    appState.value = nextState
  }

  async function ensureMonthProfile(month: string): Promise<MonthProfile> {
    const existing = monthProfiles.value.find((profile) => profile.month === month) ?? (await db.monthProfiles.get(month))
    if (existing) {
      return existing
    }

    const created = createMonthProfile(month, settings.value)
    await db.monthProfiles.put(created)
    monthProfiles.value = [created, ...monthProfiles.value].sort((left, right) => right.month.localeCompare(left.month))
    return created
  }

  async function syncArchiveForMonth(month: string): Promise<void> {
    if (month >= currentMonth.value) {
      await db.monthlyArchive.delete(month)
      archives.value = archives.value.filter((archive) => archive.month !== month)
      return
    }

    const approvedInMonth = approvedSubmissions.value.filter((entry) => getMonthKeyFromDate(entry.date) === month)
    if (approvedInMonth.length === 0) {
      await db.monthlyArchive.delete(month)
      archives.value = archives.value.filter((archive) => archive.month !== month)
      return
    }

    const snapshot = createArchiveSnapshot(month)
    await db.monthlyArchive.put(snapshot)
    archives.value = sortArchives([...archives.value.filter((archive) => archive.month !== month), snapshot])
  }

  async function syncArchivesOnInit(): Promise<void> {
    const seenMonths = Array.from(
      new Set(
        approvedSubmissions.value
          .map((entry) => getMonthKeyFromDate(entry.date))
          .filter((month) => month < currentMonth.value),
      ),
    )

    for (const month of seenMonths) {
      await ensureMonthProfile(month)
      await syncArchiveForMonth(month)
    }

    await ensureMonthProfile(currentMonth.value)
    await persistAppState({
      lastActiveMonth: currentMonth.value,
      lastOpenedAt: nowIso(),
    })
  }

  async function init(): Promise<void> {
    try {
      await ensureBaseRecords()
      await loadState()
      await syncArchivesOnInit()
      await loadState()
    } finally {
      ready.value = true
    }
  }

  async function addChore(draft: ChoreDraft): Promise<void> {
    const name = draft.name.trim()
    if (!name) {
      throw new Error('Chore name is required.')
    }

    const timestamp = nowIso()
    const chore: Chore = {
      id: createId(),
      name,
      defaultPoints: validatePositiveNumber(draft.defaultPoints, 'Default points'),
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await db.chores.put(chore)
    chores.value = sortChores([...chores.value, chore])
  }

  async function updateChore(choreId: string, draft: ChoreDraft): Promise<void> {
    const existing = chores.value.find((entry) => entry.id === choreId)
    if (!existing) {
      return
    }

    const name = draft.name.trim()
    if (!name) {
      throw new Error('Chore name is required.')
    }

    const next: Chore = {
      ...existing,
      name,
      defaultPoints: validatePositiveNumber(draft.defaultPoints, 'Default points'),
      updatedAt: nowIso(),
    }

    await db.chores.put(next)
    chores.value = sortChores(chores.value.map((entry) => (entry.id === choreId ? next : entry)))
  }

  async function deleteChore(choreId: string): Promise<void> {
    await db.chores.delete(choreId)
    chores.value = chores.value.filter((entry) => entry.id !== choreId)
  }

  async function submitChore(choreId: string, date: string): Promise<void> {
    const chore = chores.value.find((entry) => entry.id === choreId)
    if (!chore) {
      throw new Error('Choose a chore before submitting.')
    }

    if (date > getTodayDateKey()) {
      throw new Error('Only today or past dates are allowed.')
    }

    const month = getMonthKeyFromDate(date)
    await ensureMonthProfile(month)

    const timestamp = nowIso()
    const submission: ChoreSubmission = {
      id: createId(),
      choreId: chore.id,
      choreName: chore.name,
      points: chore.defaultPoints,
      date,
      status: 'pending',
      submittedAt: timestamp,
      reviewedAt: null,
      updatedAt: timestamp,
    }

    await db.submissions.put(submission)
    submissions.value = sortSubmissions([...submissions.value, submission])
  }

  async function approveSubmission(submissionId: string): Promise<void> {
    const existing = submissions.value.find((entry) => entry.id === submissionId)
    if (!existing || existing.status === 'approved') {
      return
    }

    const next: ChoreSubmission = {
      ...existing,
      status: 'approved',
      reviewedAt: nowIso(),
      updatedAt: nowIso(),
    }

    await db.submissions.put(next)
    submissions.value = sortSubmissions(submissions.value.map((entry) => (entry.id === submissionId ? next : entry)))
    await syncArchiveForMonth(getMonthKeyFromDate(next.date))
  }

  async function rejectSubmission(submissionId: string): Promise<void> {
    const existing = submissions.value.find((entry) => entry.id === submissionId)
    if (!existing || existing.status === 'rejected') {
      return
    }

    const next: ChoreSubmission = {
      ...existing,
      status: 'rejected',
      reviewedAt: nowIso(),
      updatedAt: nowIso(),
    }

    await db.submissions.put(next)
    submissions.value = sortSubmissions(submissions.value.map((entry) => (entry.id === submissionId ? next : entry)))
    await syncArchiveForMonth(getMonthKeyFromDate(next.date))
  }

  async function updateSettings(draft: SettingsDraft): Promise<void> {
    const nextSettings: SettingsRecord = {
      id: SETTINGS_ID,
      monthlyGoal: validatePositiveNumber(draft.monthlyGoal, 'Monthly goal'),
      streakDaysRequired: validatePositiveNumber(draft.streakDaysRequired, 'Streak days required'),
      streakBonusPoints: validatePositiveNumber(draft.streakBonusPoints, 'Streak bonus points'),
      minChoresForStreakDay: validatePositiveNumber(draft.minChoresForStreakDay, 'Minimum chores for streak day'),
      rewardGoal: draft.rewardGoal.trim(),
      kidName: draft.kidName.trim(),
      timezone: draft.timezone || settings.value.timezone,
      parentPin: draft.parentPin.trim(),
    }

    await db.settings.put(nextSettings)
    settings.value = nextSettings

    const activeMonthProfile: MonthProfile = {
      ...getMonthProfile(currentMonth.value),
      goalTarget: nextSettings.monthlyGoal,
      rewardGoal: nextSettings.rewardGoal,
      streakDaysRequired: nextSettings.streakDaysRequired,
      streakBonusPoints: nextSettings.streakBonusPoints,
      minChoresForStreakDay: nextSettings.minChoresForStreakDay,
      updatedAt: nowIso(),
    }

    await db.monthProfiles.put(activeMonthProfile)
    monthProfiles.value = [
      activeMonthProfile,
      ...monthProfiles.value.filter((profile) => profile.month !== activeMonthProfile.month),
    ].sort((left, right) => right.month.localeCompare(left.month))
  }

  async function setParentPin(pin: string): Promise<void> {
    const trimmed = pin.trim()
    if (trimmed.length < 4) {
      throw new Error('PIN must be at least 4 digits.')
    }

    await updateSettings({
      ...settings.value,
      parentPin: trimmed,
    })
  }

  function loginParent(pin: string): void {
    if (!hasParentPin.value) {
      throw new Error('Set a parent PIN first.')
    }

    if (settings.value.parentPin !== pin.trim()) {
      throw new Error('Incorrect PIN.')
    }

    startParentSession()
    parentAuthenticated.value = true
  }

  function logoutParent(): void {
    clearParentSession()
    parentAuthenticated.value = false
  }

  async function resetCurrentMonth(): Promise<void> {
    const month = currentMonth.value
    const targets = submissions.value.filter((entry) => getMonthKeyFromDate(entry.date) === month)
    if (targets.length) {
      await db.submissions.bulkDelete(targets.map((entry) => entry.id))
    }
    submissions.value = submissions.value.filter((entry) => getMonthKeyFromDate(entry.date) !== month)
    await syncArchiveForMonth(month)
  }

  return {
    ready,
    parentAuthenticated,
    chores,
    submissions,
    archives,
    monthProfiles,
    settings,
    appState,
    currentMonth,
    approvedSubmissions,
    pendingSubmissions,
    rejectedSubmissions,
    currentMonthProfile,
    currentMonthMetrics,
    todayApprovedSubmissions,
    todayPendingSubmissions,
    currentMonthPendingSubmissions,
    childRecentSubmissions,
    hasParentPin,
    historyEntries,
    init,
    addChore,
    updateChore,
    deleteChore,
    submitChore,
    approveSubmission,
    rejectSubmission,
    updateSettings,
    setParentPin,
    loginParent,
    logoutParent,
    resetCurrentMonth,
    getMonthProfile,
    getMonthMetrics,
    getApprovedSubmissionsForDate,
  }
})
