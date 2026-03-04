import type { Chore, SubmissionKind } from '../types/domain'

export function normalizeChoreName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export function findMatchingChore(chores: Chore[], name: string): Chore | undefined {
  const normalizedName = normalizeChoreName(name)
  return chores.find((entry) => normalizeChoreName(entry.name) === normalizedName)
}

export function resolveLibraryChore(
  chores: Chore[],
  name: string,
  points: number,
  timestamp: string,
  createId: () => string,
): { linkedChore: Chore; createdChore: Chore | null } {
  const existing = findMatchingChore(chores, name)
  if (existing) {
    return {
      linkedChore: existing,
      createdChore: null,
    }
  }

  const createdChore: Chore = {
    id: createId(),
    name: name.trim().replace(/\s+/g, ' '),
    defaultPoints: points,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  return {
    linkedChore: createdChore,
    createdChore,
  }
}

export function resolveApprovedSubmissionValues(
  kind: SubmissionKind,
  currentName: string,
  currentPoints: number,
  overrides: { choreName?: string; points?: number },
): { choreName: string; points: number } {
  if (kind !== 'proposed') {
    return {
      choreName: currentName,
      points: currentPoints,
    }
  }

  return {
    choreName: overrides.choreName?.trim().replace(/\s+/g, ' ') ?? currentName,
    points: overrides.points ?? currentPoints,
  }
}
