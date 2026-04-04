import { describe, expect, it } from 'vitest'
import { computeBadgeTier } from '../src/lib/badges'
import type { ChoreSubmission, GoalCycle, MonthProfile } from '../src/types/domain'

function makeProfile(month: string, overrides: Partial<MonthProfile> = {}): MonthProfile {
  return {
    month,
    goalTarget: 100,
    rewardGoal: 'Reward',
    streakDaysRequired: 7,
    streakBonusPoints: 5,
    minChoresForStreakDay: 1,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeCycle(overrides: Partial<GoalCycle> = {}): GoalCycle {
  return {
    id: 'cycle-1',
    rewardGoal: 'Lego Set',
    goalTarget: 100,
    startedAt: '2026-03-01T00:00:00.000Z',
    completedAt: null,
    startingPoints: 0,
    badge: null,
    ...overrides,
  }
}

function makeSubmission(date: string, overrides: Partial<ChoreSubmission> = {}): ChoreSubmission {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    kind: 'library',
    choreId: 'chore-1',
    choreName: 'Made bed',
    points: 5,
    date,
    status: 'approved',
    submittedAt: `${date}T07:00:00.000Z`,
    reviewedAt: `${date}T08:00:00.000Z`,
    updatedAt: `${date}T08:00:00.000Z`,
    ...overrides,
  }
}

const profiles: Record<string, MonthProfile> = {
  '2026-03': makeProfile('2026-03'),
  '2026-04': makeProfile('2026-04'),
}

function getMonthProfile(month: string): MonthProfile {
  return profiles[month] ?? makeProfile(month)
}

describe('computeBadgeTier', () => {
  it('returns standard when submissions span multiple months', () => {
    const cycle = makeCycle({ startedAt: '2026-03-01T00:00:00.000Z' })
    const submissions = [
      makeSubmission('2026-03-15'),
      makeSubmission('2026-03-16'),
      makeSubmission('2026-04-01'),
    ]

    expect(computeBadgeTier(submissions, cycle, getMonthProfile)).toBe('standard')
  })

  it('returns standard when there are no submissions', () => {
    const cycle = makeCycle()
    expect(computeBadgeTier([], cycle, getMonthProfile)).toBe('standard')
  })

  it('returns speed-run when all in one month but streak is broken', () => {
    const cycle = makeCycle({ startedAt: '2026-03-01T00:00:00.000Z' })
    const submissions = [
      makeSubmission('2026-03-01'),
      makeSubmission('2026-03-03'), // gap on 03-02
      makeSubmission('2026-03-04'),
    ]

    expect(computeBadgeTier(submissions, cycle, getMonthProfile)).toBe('speed-run')
  })

  it('returns perfect-month when all in one month with unbroken streak', () => {
    const cycle = makeCycle({ startedAt: '2026-03-01T00:00:00.000Z' })
    const submissions = [
      makeSubmission('2026-03-01'),
      makeSubmission('2026-03-02'),
      makeSubmission('2026-03-03'),
    ]

    expect(computeBadgeTier(submissions, cycle, getMonthProfile)).toBe('perfect-month')
  })

  it('returns perfect-month for a single submission day', () => {
    const cycle = makeCycle({ startedAt: '2026-03-10T00:00:00.000Z' })
    const submissions = [makeSubmission('2026-03-10')]

    expect(computeBadgeTier(submissions, cycle, getMonthProfile)).toBe('perfect-month')
  })

  it('returns speed-run when minChoresForStreakDay is not met on a gap day', () => {
    const strictProfiles: Record<string, MonthProfile> = {
      '2026-03': makeProfile('2026-03', { minChoresForStreakDay: 2 }),
    }

    const cycle = makeCycle({ startedAt: '2026-03-01T00:00:00.000Z' })
    const submissions = [
      makeSubmission('2026-03-01'),
      makeSubmission('2026-03-01'), // 2 on day 1
      makeSubmission('2026-03-02'), // only 1 on day 2 (needs 2)
      makeSubmission('2026-03-03'),
      makeSubmission('2026-03-03'),
    ]

    expect(
      computeBadgeTier(submissions, cycle, (m) => strictProfiles[m] ?? makeProfile(m)),
    ).toBe('speed-run')
  })

  it('ignores submissions before cycle startedAt', () => {
    const cycle = makeCycle({ startedAt: '2026-03-05T00:00:00.000Z' })
    const submissions = [
      makeSubmission('2026-03-01'), // before cycle start
      makeSubmission('2026-03-05'),
      makeSubmission('2026-03-06'),
    ]

    expect(computeBadgeTier(submissions, cycle, getMonthProfile)).toBe('perfect-month')
  })
})
