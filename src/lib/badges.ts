import type { BadgeTier, ChoreSubmission, GoalCycle, MonthProfile } from '../types/domain'
import { getMonthKeyFromDate, isNextCalendarDay } from './date'

export function computeBadgeTier(
  approvedSubmissions: ChoreSubmission[],
  cycle: GoalCycle,
  getMonthProfile: (month: string) => MonthProfile,
): BadgeTier {
  const cycleSubmissions = approvedSubmissions
    .filter((s) => (s.reviewedAt ?? s.submittedAt) >= cycle.startedAt)
    .sort((a, b) => a.date.localeCompare(b.date))

  if (cycleSubmissions.length === 0) {
    return 'standard'
  }

  const months = new Set(cycleSubmissions.map((s) => getMonthKeyFromDate(s.date)))

  if (months.size > 1) {
    return 'standard'
  }

  // Single month — check for perfect month (no streak breaks)
  const month = Array.from(months)[0]!
  const profile = getMonthProfile(month)

  const dayMap = new Map<string, number>()
  for (const s of cycleSubmissions) {
    dayMap.set(s.date, (dayMap.get(s.date) ?? 0) + 1)
  }

  const sortedDays = Array.from(dayMap.keys()).sort()
  const firstDay = sortedDays[0]!
  const lastDay = sortedDays[sortedDays.length - 1]!

  // Check every day from first to last is a qualifying streak day
  let current = firstDay
  while (current <= lastDay) {
    const count = dayMap.get(current) ?? 0
    if (count < profile.minChoresForStreakDay) {
      return 'speed-run'
    }
    const next = nextDay(current)
    if (next > lastDay) break
    if (!isNextCalendarDay(current, next)) break
    current = next
  }

  return 'perfect-month'
}

function nextDay(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00`)
  date.setDate(date.getDate() + 1)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
