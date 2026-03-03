# Chore Tracker — Product Requirements Document

## Overview

A Progressive Web App (PWA) for tracking a child's daily chores toward a monthly point goal. The parent logs chore entries on the child's behalf. Points accumulate throughout the month, and if the child hits the target, they earn a reward. The app is designed primarily for use on an iPad, installed via "Add to Home Screen" from Safari.

## Product Goal

Help a parent quickly log chores, show a child visible progress toward a monthly reward, and preserve month-by-month history without requiring an account or cloud backend.

## Target Users

- **Primary user:** Parent (logs chores, manages settings)
- **Secondary user:** Child (views progress, stays motivated)

## Platform & Technical Stack

- **Type:** Progressive Web App (PWA)
- **Primary device:** iPad (tablet-first responsive design, also works on phones and desktop)
- **Framework:** Vue 3 with TypeScript
- **Build tooling:** Vite
- **Styling:** Tailwind CSS
- **Storage:** IndexedDB via a lightweight wrapper such as Dexie.js
- **Data model principle:** Keep raw logs permanently and derive streaks, totals, and monthly summaries from those logs
- **Backend:** None
- **PWA requirements:**
  - `manifest.json` with app name, icons, theme color, `display: standalone`
  - Service worker for offline support and app shell caching
  - Installable via Safari "Add to Home Screen"

## Product Rules

### Points & Goal

- Each chore has a configurable default point value
- Monthly goal defaults to **100 points** and is configurable in settings
- Monthly progress is scoped to a single calendar month
- Points shown for a month are the sum of:
  - Chore log points within that month
  - Derived streak bonus points within that month

### Streak System

- Streaks are a **derived monthly calculation**, not primary stored state
- Streaks are calculated independently for each month
- Streaks do **not** continue across month boundaries
- A **qualifying streak day** is a day in the selected month where logged chores meet or exceed `minChoresForStreakDay`
- A streak bonus is awarded every time the running streak reaches a multiple of `streakDaysRequired`
- Bonus points use the configured `streakBonusPoints` value
- The dashboard's **current streak** is the consecutive run of qualifying days in the current month ending on the most recent qualifying day in that month
- The month view also shows **longest streak** for that month
- Any add, edit, delete, or backdated log change recalculates that month's streak-derived values

### Reward Goal

- The parent can set an optional reward goal name or description for the active month
- The active reward goal is displayed prominently on the dashboard
- Reward goal changes apply immediately to the current month
- The reward goal is snapshotted into monthly history when a month is archived

### Time & Calendar Rules

- The app uses the device's local timezone for all day and month boundaries
- Each `ChoreLog.date` is stored as a local calendar date string in `YYYY-MM-DD`
- Month views are filtered by the date string prefix `YYYY-MM`
- The app supports backdated logging for past dates, but not future dates

---

## MVP vs Phase 2

### MVP

- Dashboard
- Add chore flow
- Chore library manager
- Settings
- Month summary and history list
- Detailed month view for current and past months
- Derived streak calculation and bonuses
- Local persistence in IndexedDB
- Offline-capable installed PWA after first successful load

### Phase 2

- Confetti and richer celebration animations
- CSV export
- Expanded onboarding polish
- iPad splash screen image set
- Additional visual polish for streak milestones

---

## Data Model

### Chore

```ts
{
  id: string
  name: string
  defaultPoints: number
  createdAt: string
  updatedAt: string
}
```

### ChoreLog

```ts
{
  id: string
  choreId: string
  choreName: string
  points: number
  date: string
  createdAt: string
  updatedAt: string
}
```

### MonthlyArchive

```ts
{
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
```

### Settings

```ts
{
  monthlyGoal: number
  streakDaysRequired: number
  streakBonusPoints: number
  minChoresForStreakDay: number
  rewardGoal: string
  kidName: string
  timezone: string
}
```

### AppState

```ts
{
  id: "app-state"
  lastActiveMonth: string
  lastOpenedAt: string
}
```

### Derived Month Metrics

These values are calculated at runtime for any selected month and do not need to be treated as the source of truth:

```ts
{
  month: string
  chorePoints: number
  bonusPoints: number
  totalPoints: number
  currentStreak: number
  longestStreak: number
  streakBonusDates: string[]
  daysWithLogs: string[]
  pointsByDay: Record<string, number>
}
```

---

## Screens & Features

### 1. Dashboard

This is the home screen shown when opening the app.

**Layout**

- Kid's name and current month
- Reward goal banner if present
- Large progress indicator showing current month points vs. monthly goal
- Percentage label
- Current streak and next bonus milestone
- Today's chore log list
- Large primary `Add Chore` action
- Quick stats:
  - Days remaining in the month
  - Points needed to reach goal

**Acceptance Criteria**

- Opening the app shows the current month summary within one screen without extra navigation
- Progress reflects all current-month logs plus derived streak bonuses
- Today's list shows only logs for today
- Deleting a log updates totals and streak-derived values immediately
- Goal reached state is visually distinct and persists for the remainder of the month

### 2. Add Chore Entry

Triggered by tapping `Add Chore` on the dashboard.

**Interaction**

- Open a modal or bottom sheet with the chore library
- Selecting a chore opens a lightweight confirmation step
- The confirmation step allows:
  - Adjusting point value
  - Changing the date to a past date in the current or prior months
  - Confirming the entry
- `Add New Chore` is available inline from the same surface

**Acceptance Criteria**

- Parent can log a chore in no more than two confirmations from the dashboard
- Future dates cannot be selected
- Edited point values apply only to that log entry and do not overwrite the chore's default value
- Saving a log recalculates month totals and streak-derived values for the affected month

### 3. Month Detail View

A calendar-style overview of a selected month.

- Each day cell shows:
  - Whether chores were logged
  - Total points earned that day
  - Whether the day qualified for the month streak
  - Whether a streak bonus milestone was earned that day
- Tapping a day shows the list of logs for that date
- The view supports current and past months
- Running totals and longest streak are shown below or alongside the calendar

**Acceptance Criteria**

- Past months remain viewable in detail without restoring archived data
- Day detail reflects raw logs for that date
- Bonus days are derived from the selected month's streak calculation, not manually entered records

### 4. Chore Library Manager

- List all saved chores with default point values
- Add, edit, and delete chore templates
- Deleting a chore does not delete historical logs

**Acceptance Criteria**

- Editing a chore updates future selections only
- Existing `ChoreLog` records preserve their stored `choreName` and `points`
- Duplicate chore names are allowed but discouraged through UI copy or validation messaging

### 5. History

View past months' results.

- List months most recent first
- Each month card shows:
  - Month and year
  - Total points
  - Goal reached status
  - Reward goal snapshot
  - Longest streak
- Selecting a month opens the month detail view for that month

**Acceptance Criteria**

- History is available even after several months of inactivity
- Month cards are generated from `MonthlyArchive` when available, with derived fallback from logs if needed

### 6. Settings

- Kid's name
- Monthly goal
- Streak days required
- Streak bonus points
- Minimum chores per day for a streak day
- Reward goal for the active month
- Reset current month
- Export data marked clearly as Phase 2 or hidden until implemented

**Acceptance Criteria**

- Changing streak settings triggers recomputation for the current month immediately
- Changing monthly goal updates the current month's progress immediately
- Reset current month requires confirmation and only clears logs for the current month

---

## User Flows

### Daily Flow

1. Parent opens app
2. Dashboard shows current month progress, streak info, and today's logs
3. Parent taps `Add Chore`
4. Parent selects a chore, optionally adjusts points or date, then confirms
5. Dashboard updates immediately

### Delete Flow

1. Parent opens today's list or day detail view
2. Parent deletes a log
3. Confirmation prompt appears
4. After confirmation, the log is removed
5. The affected month's totals and streak-derived values are recalculated

### First-Time Setup

1. App opens for the first time
2. User sets kid name
3. User adds the first chore template
4. User optionally sets the current reward goal
5. User lands on the dashboard

### Month Transition Flow

1. On app open, compare the current month to `lastActiveMonth`
2. For each unarchived month between `lastActiveMonth` and the current month:
   - Derive month totals and longest streak from logs
   - Save a `MonthlyArchive` snapshot if one does not already exist
3. Keep all raw logs intact
4. Update `lastActiveMonth`
5. Show the new month's dashboard with fresh month-scoped totals

---

## Business Rules & Edge Cases

- Multiple chores with the same template can be logged on the same day
- Custom one-off point adjustments are allowed per log
- `0` or negative point values are not allowed
- Deleting the only qualifying chore on a streak day may remove that day from streak calculations and change bonus outcomes for the month
- Changing streak settings mid-month applies immediately to the current month and recalculates that month
- Changing monthly goal mid-month applies immediately to the current month
- Reward goal changes affect the active month immediately and are captured in that month's archive snapshot when archived
- If the app is not opened for several months, archival is processed for each missed month on the next open
- Reset current month removes only current-month logs; prior logs and prior archive records remain intact

---

## Design Guidelines

### Visual Style

- Playful but clean
- Bright, friendly colors that work for both parent and child
- Progress visualization is the hero element
- Large touch targets with a minimum of 48x48px
- Friendly rounded typography

### Layout

- Optimized for iPad portrait and landscape
- Minimum 16px body text
- Bottom navigation is preferred over hamburger menus
- Most actions should be reachable in one to two taps from the dashboard

### Accessibility

- Sufficient contrast for all text and controls
- Screen-reader-friendly labels on all interactive elements
- Touch targets meet WCAG size guidance

---

## PWA Configuration

### manifest.json

```json
{
  "name": "Chore Tracker",
  "short_name": "Chores",
  "description": "Track daily chores and earn rewards",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "orientation": "any",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Offline Requirements

- After one successful load, the app shell opens without network access
- All locally stored logs, chores, settings, and history remain usable offline
- No core feature requires a network request after initial install

### iPad-Specific

- Include `<meta name="apple-mobile-web-app-capable" content="yes">`
- Include `<meta name="apple-mobile-web-app-status-bar-style" content="default">`
- Include `apple-touch-icon` links for the home screen icon

---

## Technical Notes

### IndexedDB Schema

Use Dexie.js or an equivalent wrapper with stores:

```ts
chores: id, name, defaultPoints, createdAt, updatedAt
choreLogs: id, choreId, choreName, points, date, createdAt, updatedAt
monthlyArchive: month, totalPoints, chorePoints, bonusPoints, goalTarget, goalReached, rewardGoal, longestStreak, archivedAt
settings: id, monthlyGoal, streakDaysRequired, streakBonusPoints, minChoresForStreakDay, rewardGoal, kidName, timezone
appState: id, lastActiveMonth, lastOpenedAt
```

Recommended indexes:

- `choreLogs.date`
- `choreLogs.choreId`
- `monthlyArchive.month`

### Streak Calculation Logic

```ts
function calculateMonthMetrics(logs, month, settings) {
  const monthLogs = logs.filter((log) => log.date.startsWith(month));
  const qualifyingDays = getQualifyingDays(monthLogs, settings.minChoresForStreakDay);
  const orderedDays = sortAscending(qualifyingDays);

  let runningStreak = 0;
  let longestStreak = 0;
  let previousQualifiedDay = null;
  const streakBonusDates = [];

  for (const day of orderedDays) {
    if (previousQualifiedDay && isNextCalendarDay(previousQualifiedDay, day)) {
      runningStreak += 1;
    } else {
      runningStreak = 1;
    }

    longestStreak = Math.max(longestStreak, runningStreak);
    previousQualifiedDay = day;

    if (runningStreak % settings.streakDaysRequired === 0) {
      streakBonusDates.push(day);
    }
  }

  return {
    currentStreak: getTrailingRunLength(orderedDays),
    longestStreak,
    streakBonusDates
  };
}
```

Implementation rule:

- Recalculate the affected month's derived metrics after every log add, edit, delete, settings change, or month transition

### Archival Logic

- `MonthlyArchive` is a snapshot for fast history summaries, not the source of truth
- Raw logs remain stored permanently
- If an archive record is missing, the app can derive a month summary from logs and recreate the archive

---

## Out of Scope

- Multiple children or profiles
- Cloud sync or backup
- Push notifications or reminders
- Parent approval workflow
- Photo proof of chore completion
- Allowance or money tracking
- Shared access across devices

---

## Future Considerations

- Multi-child support
- Cloud sync
- Reminders
- Parent approval mode
- Reward marketplace
