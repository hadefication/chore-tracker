import { describe, expect, it } from 'vitest'
import { findMatchingChore, normalizeChoreName, resolveApprovedSubmissionValues, resolveLibraryChore } from '../src/lib/chore-utils'
import type { Chore } from '../src/types/domain'

const chores: Chore[] = [
  {
    id: 'chore-1',
    name: 'Wash Dishes',
    defaultPoints: 4,
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-01T00:00:00.000Z',
  },
]

describe('chore library matching', () => {
  it('normalizes names for case-insensitive matching', () => {
    expect(normalizeChoreName('  Wash   Dishes  ')).toBe('wash dishes')
  })

  it('finds an existing chore by normalized name', () => {
    expect(findMatchingChore(chores, ' wash dishes ')).toEqual(chores[0])
  })

  it('reuses the existing library chore without changing its default points', () => {
    const resolution = resolveLibraryChore(chores, 'wash dishes', 9, '2026-03-04T08:00:00.000Z', () => 'new-id')

    expect(resolution.linkedChore).toEqual(chores[0])
    expect(resolution.createdChore).toBeNull()
    expect(resolution.linkedChore.defaultPoints).toBe(4)
  })

  it('creates a new chore when there is no normalized-name match', () => {
    const resolution = resolveLibraryChore(chores, 'Vacuum room', 6, '2026-03-04T08:00:00.000Z', () => 'new-id')

    expect(resolution.linkedChore).toEqual({
      id: 'new-id',
      name: 'Vacuum room',
      defaultPoints: 6,
      createdAt: '2026-03-04T08:00:00.000Z',
      updatedAt: '2026-03-04T08:00:00.000Z',
    })
    expect(resolution.createdChore).toEqual(resolution.linkedChore)
  })

  it('uses parent-edited proposed chore values during approval', () => {
    expect(
      resolveApprovedSubmissionValues('proposed', 'Big yard job', 20, {
        choreName: '  Yard cleanup  ',
        points: 8,
      }),
    ).toEqual({
      choreName: 'Yard cleanup',
      points: 8,
    })
  })

  it('keeps original values for library submissions during approval', () => {
    expect(
      resolveApprovedSubmissionValues('library', 'Wash Dishes', 4, {
        choreName: 'Something else',
        points: 12,
      }),
    ).toEqual({
      choreName: 'Wash Dishes',
      points: 4,
    })
  })
})
