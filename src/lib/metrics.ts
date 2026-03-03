import type { ChoreSubmission, DaySummary, MonthMetrics, MonthProfile } from '../types/domain'
import { compareDateKeys, getMonthDayKeys, getMonthKeyFromDate, isNextCalendarDay } from './date'

export function calculateMonthMetrics(
  submissions: ChoreSubmission[],
  month: string,
  profile: MonthProfile,
): MonthMetrics {
  const approved = submissions
    .filter((submission) => submission.status === 'approved' && getMonthKeyFromDate(submission.date) === month)
    .sort((left, right) => compareDateKeys(left.date, right.date) || right.submittedAt.localeCompare(left.submittedAt))

  const dayMap = new Map<string, ChoreSubmission[]>()

  for (const submission of approved) {
    const bucket = dayMap.get(submission.date) ?? []
    bucket.push(submission)
    dayMap.set(submission.date, bucket)
  }

  const daysWithLogs = Array.from(dayMap.keys()).sort(compareDateKeys)
  const qualifyingDays = daysWithLogs.filter((dateKey) => {
    const entries = dayMap.get(dateKey) ?? []
    return entries.length >= profile.minChoresForStreakDay
  })

  let runningStreak = 0
  let longestStreak = 0
  let trailingStreak = 0
  let previousQualifiedDay: string | null = null
  const streakBonusDates: string[] = []

  for (const day of qualifyingDays) {
    if (previousQualifiedDay && isNextCalendarDay(previousQualifiedDay, day)) {
      runningStreak += 1
    } else {
      runningStreak = 1
    }

    previousQualifiedDay = day
    longestStreak = Math.max(longestStreak, runningStreak)

    if (runningStreak % profile.streakDaysRequired === 0) {
      streakBonusDates.push(day)
    }
  }

  for (let index = qualifyingDays.length - 1; index >= 0; index -= 1) {
    const current = qualifyingDays[index]
    const previous = qualifyingDays[index - 1]

    if (!current) {
      break
    }

    trailingStreak += 1

    if (!previous || !isNextCalendarDay(previous, current)) {
      break
    }
  }

  const pointsByDay = Object.fromEntries(
    getMonthDayKeys(month).map((dateKey) => {
      const entries = dayMap.get(dateKey) ?? []
      const total = entries.reduce((sum, entry) => sum + entry.points, 0)
      return [dateKey, total]
    }),
  )

  const daySummaries = Object.fromEntries(
    getMonthDayKeys(month).map((dateKey) => {
      const entries = (dayMap.get(dateKey) ?? []).slice().sort((left, right) => right.submittedAt.localeCompare(left.submittedAt))
      const summary: DaySummary = {
        date: dateKey,
        totalPoints: pointsByDay[dateKey] ?? 0,
        qualifying: qualifyingDays.includes(dateKey),
        bonusAwarded: streakBonusDates.includes(dateKey),
        approvedSubmissions: entries,
      }
      return [dateKey, summary]
    }),
  )

  const chorePoints = approved.reduce((sum, entry) => sum + entry.points, 0)
  const bonusPoints = streakBonusDates.length * profile.streakBonusPoints
  const totalPoints = chorePoints + bonusPoints
  const remainder = trailingStreak % profile.streakDaysRequired
  const nextBonusIn = remainder === 0 ? profile.streakDaysRequired : profile.streakDaysRequired - remainder

  return {
    month,
    goalTarget: profile.goalTarget,
    rewardGoal: profile.rewardGoal,
    chorePoints,
    bonusPoints,
    totalPoints,
    currentStreak: trailingStreak,
    longestStreak,
    nextBonusIn,
    goalReached: totalPoints >= profile.goalTarget,
    streakBonusDates,
    daysWithLogs,
    pointsByDay,
    daySummaries,
  }
}
