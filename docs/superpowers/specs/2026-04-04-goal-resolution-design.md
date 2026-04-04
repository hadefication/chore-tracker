# Goal Resolution Feature — Design Spec

## Overview

Replace month-scoped goal tracking with **Goal Cycles** — a cycle-based system where points accumulate until the parent resolves a win, regardless of calendar month boundaries. Adds confetti celebration, tiered badges, and a trophy shelf for displaying past wins.

## Problem

The current system tracks goals per calendar month, but parents sometimes approve submissions late, causing points to land in the wrong month. The goal lifecycle is really parent-driven (set reward → kid earns it → celebrate → new reward), not calendar-driven.

## Solution: Goal Cycles

Decouple goals from calendar months. A `GoalCycle` represents one reward pursuit from start to resolution. Points accumulate across months within a cycle. When the kid hits the target, the parent resolves the win and starts a new cycle.

---

## Data Model

### New: `GoalCycle`

```ts
{
  id: string
  rewardGoal: string
  goalTarget: number
  startedAt: string           // ISO datetime
  completedAt: string | null  // ISO datetime when parent resolved
  startingPoints: number      // rollover from previous cycle (0 if fresh)
  earnedPoints: number        // derived: sum of approved submission points since startedAt
  totalPoints: number         // derived: startingPoints + earnedPoints
  badge: 'standard' | 'speed-run' | 'perfect-month' | null
}
```

### New Dexie table

```
goalCycles: id, completedAt
```

Added as a v3 schema migration.

### Constraints

- Only one active cycle at a time (`completedAt === null`).
- `earnedPoints` and `totalPoints` are computed from approved submissions dated on or after `startedAt`, not stored.
- `badge` is `null` while active, set on completion.

---

## Badge Tiers

Computed at resolution time by examining approved submissions within the cycle:

| Badge | Criteria |
|-------|----------|
| **Perfect month** | All submissions fall within one calendar month AND every day from first to last submission was a qualifying streak day (no streak breaks) |
| **Speed run** | All submissions fall within one calendar month (but streak was broken at some point) |
| **Standard** | Submissions span multiple calendar months |

### Visual Treatment

- **Perfect month**: Gold, star icon
- **Speed run**: Silver, lightning bolt icon
- **Standard**: Bronze, checkmark icon

---

## Goal Resolution Flow

### Detection

`goalReached` is true when `totalPoints >= goalTarget` on the active cycle.

### Child Dashboard — Celebration

- Confetti animation triggers when `goalReached` transitions from `false` to `true`.
- Also triggers once on first dashboard visit after goal is reached (for cases where the parent approved while the kid wasn't looking).
- Uses `canvas-confetti` library (~6kb).
- A `celebrationSeen` flag in component state (not persisted) prevents re-triggering on subsequent navigations within the same session.
- Celebration overlay shows: "You did it!", reward name, badge tier.

### Parent Dashboard — Resolution Banner

- When goal is reached, a prominent "Goal Reached" banner appears on the parent dashboard.
- Banner includes a "Resolve & Set New Goal" button.

### Resolution Dialog

Opened when parent taps "Resolve & Set New Goal":

1. **Win summary**: Reward name, points earned, badge tier, date range (startedAt → now).
2. **New cycle form**:
   - New reward goal name (required)
   - New point target (defaults to previous cycle's target)
   - Toggle: "Carry over X extra points" (shows excess amount, e.g., "Carry over 15 points", default on)
3. **On confirm**:
   - Active cycle: set `completedAt`, compute and save `badge`.
   - Create new cycle: `startedAt` = now, `startingPoints` = excess if rollover enabled else 0, `goalTarget` and `rewardGoal` from form.

---

## Badges & Win Display

### Child Dashboard — Trophy Shelf

- Section displaying completed cycles as badge cards.
- Each card shows: reward name, points earned, badge tier icon, completion date.
- Most recent win is featured (larger), older wins displayed in a row.

### Parent History View

- Completed cycles listed in history.
- Each win card shows: reward name, target vs earned, badge tier, date range (start → completed), rollover given.
- Existing monthly archive cards remain for calendar/streak reference.

---

## Existing Systems — Impact

### Unchanged

- Submissions (pending/approved/rejected): no schema or logic changes.
- Chore library: no changes.
- Streak calculation: remains month-scoped, derived from approved submissions per calendar month.
- Monthly archives: still created for calendar/streak views. No longer the primary progress tracker.
- Calendar/month view: unchanged, still shows daily activity and streaks.

### Modified

- **Settings**: `rewardGoal` and `monthlyGoal` become defaults for new cycles rather than the live goal tracker. Streak settings stay in settings/month profiles.
- **Metrics computation**: `currentMonthMetrics.goalReached` is replaced by (or supplemented with) active cycle's `goalReached` for dashboard display. Month metrics still compute `goalReached` for archive purposes.
- **Parent dashboard**: Gains the resolution banner and button.
- **Child dashboard**: Gains confetti, celebration overlay, and trophy shelf.
- **History view**: Gains completed cycle cards alongside monthly archives.

---

## Migration

### Database

- Add `goalCycles` table in Dexie v3 schema.
- On first load after upgrade: create one active `GoalCycle` seeded from current settings (`rewardGoal`, `monthlyGoal`) with `startedAt` = now, `startingPoints` = 0.

### Data

- No data loss. All existing submissions, archives, and settings preserved.
- Existing approved submissions before migration do NOT count toward the new cycle — it starts fresh.
- Past monthly archives remain viewable in history but are not retroactively converted to wins.

---

## Dependencies

- `canvas-confetti` npm package (~6kb) for celebration animation.

---

## Out of Scope

- Multi-child support (each child having their own cycles).
- Cloud sync of cycle/win data.
- Custom badge icons or images.
- Editing or deleting past wins.
