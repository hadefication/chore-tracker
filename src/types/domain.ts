export interface Chore {
  id: string
  name: string
  defaultPoints: number
  createdAt: string
  updatedAt: string
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface ChoreSubmission {
  id: string
  choreId: string
  choreName: string
  points: number
  date: string
  status: SubmissionStatus
  submittedAt: string
  reviewedAt: string | null
  updatedAt: string
}

export interface MonthlyArchive {
  month: string
  totalPoints: number
  chorePoints: number
  bonusPoints: number
  goalTarget: number
  goalReached: boolean
  rewardGoal: string | null
  longestStreak: number
  archivedAt: string
}

export interface SettingsRecord {
  id: 'settings'
  monthlyGoal: number
  streakDaysRequired: number
  streakBonusPoints: number
  minChoresForStreakDay: number
  rewardGoal: string
  kidName: string
  timezone: string
  parentPin: string
}

export interface MonthProfile {
  month: string
  goalTarget: number
  rewardGoal: string
  streakDaysRequired: number
  streakBonusPoints: number
  minChoresForStreakDay: number
  updatedAt: string
}

export interface AppStateRecord {
  id: 'app-state'
  lastActiveMonth: string
  lastOpenedAt: string
}

export interface DaySummary {
  date: string
  totalPoints: number
  qualifying: boolean
  bonusAwarded: boolean
  approvedSubmissions: ChoreSubmission[]
}

export interface MonthMetrics {
  month: string
  goalTarget: number
  rewardGoal: string
  chorePoints: number
  bonusPoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  nextBonusIn: number
  goalReached: boolean
  streakBonusDates: string[]
  daysWithLogs: string[]
  pointsByDay: Record<string, number>
  daySummaries: Record<string, DaySummary>
}

export type ChoreDraft = Pick<Chore, 'name' | 'defaultPoints'>
export type SettingsDraft = Omit<SettingsRecord, 'id'>
