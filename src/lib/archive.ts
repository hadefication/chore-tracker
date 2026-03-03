import { calculateMonthMetrics } from './metrics'
import type { ChoreSubmission, MonthProfile, MonthlyArchive } from '../types/domain'

export function createMonthlyArchiveSnapshot(
  submissions: ChoreSubmission[],
  month: string,
  profile: MonthProfile,
  archivedAt: string,
): MonthlyArchive {
  const metrics = calculateMonthMetrics(submissions, month, profile)

  return {
    month,
    totalPoints: metrics.totalPoints,
    chorePoints: metrics.chorePoints,
    bonusPoints: metrics.bonusPoints,
    goalTarget: metrics.goalTarget,
    goalReached: metrics.goalReached,
    rewardGoal: profile.rewardGoal || null,
    longestStreak: metrics.longestStreak,
    archivedAt,
  }
}
