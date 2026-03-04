import { describe, expect, it } from 'vitest'
import { createMonthlyArchiveSnapshot } from '../src/lib/archive'
import { calculateMonthMetrics } from '../src/lib/metrics'
import type { ChoreSubmission, MonthProfile } from '../src/types/domain'

const profile: MonthProfile = {
  month: '2026-03',
  goalTarget: 20,
  rewardGoal: 'Lego Set',
  streakDaysRequired: 2,
  streakBonusPoints: 3,
  minChoresForStreakDay: 1,
  updatedAt: '2026-03-01T00:00:00.000Z',
}

function submission(overrides: Partial<ChoreSubmission>): ChoreSubmission {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    kind: overrides.kind ?? 'library',
    choreId: overrides.choreId ?? 'chore-1',
    choreName: overrides.choreName ?? 'Made bed',
    points: overrides.points ?? 2,
    date: overrides.date ?? '2026-03-01',
    status: overrides.status ?? 'pending',
    submittedAt: overrides.submittedAt ?? '2026-03-01T07:00:00.000Z',
    reviewedAt: overrides.reviewedAt ?? null,
    updatedAt: overrides.updatedAt ?? '2026-03-01T07:00:00.000Z',
  }
}

describe('approval domain rules', () => {
  it('ignores pending submissions in month metrics', () => {
    const metrics = calculateMonthMetrics(
      [
        submission({ id: 'pending-1', status: 'pending', date: '2026-03-01', points: 4 }),
        submission({ id: 'approved-1', status: 'approved', date: '2026-03-01', points: 5 }),
      ],
      '2026-03',
      profile,
    )

    expect(metrics.chorePoints).toBe(5)
    expect(metrics.totalPoints).toBe(5)
    expect(metrics.currentStreak).toBe(1)
  })

  it('adds points and streak bonus only after approval', () => {
    const pending = [
      submission({ id: 'one', status: 'pending', date: '2026-03-01', points: 4 }),
      submission({ id: 'two', status: 'pending', date: '2026-03-02', points: 4 }),
    ]

    const pendingMetrics = calculateMonthMetrics(pending, '2026-03', profile)
    expect(pendingMetrics.totalPoints).toBe(0)
    expect(pendingMetrics.currentStreak).toBe(0)

    const approvedMetrics = calculateMonthMetrics(
      pending.map((entry, index) => ({
        ...entry,
        status: 'approved',
        reviewedAt: `2026-03-0${index + 1}T10:00:00.000Z`,
      })),
      '2026-03',
      profile,
    )

    expect(approvedMetrics.chorePoints).toBe(8)
    expect(approvedMetrics.bonusPoints).toBe(3)
    expect(approvedMetrics.totalPoints).toBe(11)
    expect(approvedMetrics.currentStreak).toBe(2)
    expect(approvedMetrics.streakBonusDates).toEqual(['2026-03-02'])
  })

  it('keeps rejected submissions out of totals', () => {
    const metrics = calculateMonthMetrics(
      [
        submission({ id: 'approved', status: 'approved', date: '2026-03-01', points: 6 }),
        submission({ id: 'rejected', status: 'rejected', date: '2026-03-02', points: 7, reviewedAt: '2026-03-02T09:00:00.000Z' }),
      ],
      '2026-03',
      profile,
    )

    expect(metrics.chorePoints).toBe(6)
    expect(metrics.totalPoints).toBe(6)
    expect(metrics.daysWithLogs).toEqual(['2026-03-01'])
  })

  it('archives approved-only history summaries', () => {
    const archive = createMonthlyArchiveSnapshot(
      [
        submission({ id: 'approved-a', status: 'approved', date: '2026-03-01', points: 5 }),
        submission({ id: 'approved-b', status: 'approved', date: '2026-03-02', points: 5, reviewedAt: '2026-03-02T09:00:00.000Z' }),
        submission({ id: 'pending-c', status: 'pending', date: '2026-03-03', points: 9 }),
        submission({ id: 'rejected-d', status: 'rejected', date: '2026-03-04', points: 9, reviewedAt: '2026-03-04T09:00:00.000Z' }),
      ],
      '2026-03',
      profile,
      '2026-04-01T00:00:00.000Z',
    )

    expect(archive.totalPoints).toBe(13)
    expect(archive.chorePoints).toBe(10)
    expect(archive.bonusPoints).toBe(3)
    expect(archive.goalReached).toBe(false)
    expect(archive.longestStreak).toBe(2)
    expect(archive.rewardGoal).toBe('Lego Set')
  })
})
